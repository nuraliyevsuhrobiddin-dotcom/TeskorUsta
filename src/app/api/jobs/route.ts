import { createClient } from "@/lib/supabase/server";

const JOB_IMAGE_BUCKET = "job-images";
const JOB_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const JOB_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validateImage(file: File) {
  if (!JOB_IMAGE_TYPES.includes(file.type as (typeof JOB_IMAGE_TYPES)[number])) {
    return "Faqat JPG, PNG yoki WEBP rasm yuklash mumkin";
  }

  if (file.size > JOB_IMAGE_MAX_SIZE_BYTES) {
    return "Rasm 5MB dan oshmasligi kerak";
  }

  return null;
}

function buildImagePath(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = extension === "jpeg" ? "jpg" : extension;
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return `jobs/${randomId}.${safeExtension}`;
}

async function sendTelegramMessage(input: {
  category: string;
  district: string;
  description: string;
  phone: string;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram credentials are missing. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.");
    return false;
  }

  const text = [
    "New request:",
    `Category: ${input.category}`,
    `District: ${input.district}`,
    `Description: ${input.description}`,
    `Phone: ${input.phone}`,
  ].join("\n");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Telegram sendMessage failed:", errorText);
    return false;
  }

  return true;
}

async function logServerEvent(input: {
  eventType: string;
  path: string;
  metadata: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("app_events").insert({
    user_id: null,
    event_type: input.eventType,
    path: input.path,
    metadata: input.metadata,
  });

  if (error) {
    console.error("Server analytics event failed:", error);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const category = getFormString(formData, "category");
    const district = getFormString(formData, "district");
    const description = getFormString(formData, "description");
    const phone = getFormString(formData, "phone");
    const image = formData.get("image");

    if (!category || !district || !description || !phone) {
      return Response.json({ error: "Required fields are missing" }, { status: 400 });
    }

    const supabase = await createClient();
    let imageUrl: string | null = null;

    if (image instanceof File && image.size > 0) {
      const validationError = validateImage(image);
      if (validationError) {
        return Response.json({ error: validationError }, { status: 400 });
      }

      const path = buildImagePath(image);
      const { error: uploadError } = await supabase.storage
        .from(JOB_IMAGE_BUCKET)
        .upload(path, image, {
          cacheControl: "3600",
          upsert: false,
          contentType: image.type,
        });

      if (uploadError) {
        console.error("Error uploading job image:", uploadError);
        return Response.json({ error: "Image upload failed" }, { status: 500 });
      }

      const { data } = supabase.storage.from(JOB_IMAGE_BUCKET).getPublicUrl(path);
      imageUrl = data.publicUrl;
    }

    const { error: insertError } = await supabase.from("jobs").insert({
      category,
      district,
      description,
      phone,
      image_url: imageUrl,
    });

    if (insertError) {
      console.error("Error creating job request:", insertError);
      return Response.json({ error: "Job request was not saved" }, { status: 500 });
    }

    const telegramSent = await sendTelegramMessage({
      category,
      district,
      description,
      phone,
    });

    await logServerEvent({
      eventType: "telegram_sent",
      path: "/api/jobs",
      metadata: {
        success: telegramSent,
        category,
        district,
        phone,
      },
    });

    return Response.json({ ok: true, telegramSent }, { status: 201 });
  } catch (error) {
    console.error("Unexpected job request error:", error);
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}
