"use client";

import { useEffect, useMemo, useState } from "react";
import { PlusCircle, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  addCrmLead,
  AdminJob,
  CrmLead,
  CrmLeadStatus,
  deleteCrmLead,
  fetchAdminJobs,
  fetchCrmLeads,
  JobStatus,
  updateCrmLead,
  updateJobStatus,
} from "@/lib/supabase/api";

const emptyLead: Omit<CrmLead, "id" | "listingName" | "createdAt"> = {
  name: "",
  phone: "",
  source: "manual",
  status: "new",
  note: "",
  listingId: null,
  nextFollowUp: null,
};

const statusLabels: Record<CrmLeadStatus, string> = {
  new: "Yangi",
  contacted: "Bog'lanildi",
  won: "Mijoz bo'ldi",
  lost: "Yo'qotildi",
};

const jobStatusLabels: Record<JobStatus, string> = {
  new: "Yangi",
  contacted: "Bog'lanildi",
  assigned: "Ustaga berildi",
  done: "Bajarildi",
};

export default function AdminCrmPage() {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [draft, setDraft] = useState(emptyLead);
  const [status, setStatus] = useState<CrmLeadStatus | "all">("all");
  const [jobStatus, setJobStatus] = useState<JobStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);

  const loadLeads = async () => {
    setLoading(true);
    setLeads(await fetchCrmLeads());
    setLoading(false);
  };

  const loadJobs = async () => {
    setJobsLoading(true);
    setJobs(await fetchAdminJobs());
    setJobsLoading(false);
  };

  useEffect(() => {
    loadLeads();
    loadJobs();
  }, []);

  const filteredLeads = useMemo(
    () => leads.filter((lead) => status === "all" || lead.status === status),
    [leads, status]
  );

  const filteredJobs = useMemo(
    () =>
      jobs
        .filter((job) => jobStatus === "all" || job.status === jobStatus)
        .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()),
    [jobs, jobStatus]
  );

  const createLead = async () => {
    if (!draft.name.trim() || !draft.phone.trim()) {
      toast.error("Ism va telefonni kiriting");
      return;
    }

    const success = await addCrmLead(draft);
    if (!success) {
      toast.error("Lead yaratib bo'lmadi");
      return;
    }

    toast.success("Lead yaratildi");
    setDraft(emptyLead);
    loadLeads();
  };

  const patchLead = (id: string, patch: Partial<CrmLead>) => {
    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, ...patch } : lead)));
  };

  const saveLead = async (lead: CrmLead) => {
    const success = await updateCrmLead(lead.id, {
      name: lead.name,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      note: lead.note,
      listingId: lead.listingId,
      nextFollowUp: lead.nextFollowUp,
    });

    if (success) toast.success("Lead saqlandi");
    else toast.error("Lead saqlanmadi");
  };

  const removeLead = async (id: string) => {
    if (!window.confirm("Leadni o'chirishni tasdiqlaysizmi?")) return;

    const success = await deleteCrmLead(id);
    if (!success) {
      toast.error("Lead o'chirilmadi");
      return;
    }

    setLeads((current) => current.filter((lead) => lead.id !== id));
    toast.success("Lead o'chirildi");
  };

  const changeJobStatus = async (id: string, nextStatus: JobStatus) => {
    const success = await updateJobStatus(id, nextStatus);
    if (!success) {
      toast.error("Job status yangilanmadi");
      return;
    }

    setJobs((current) => current.map((job) => (job.id === id ? { ...job, status: nextStatus } : job)));
    toast.success("Job status yangilandi");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">CRM</h1>
          <p className="text-sm text-slate-500">Mijoz leadlari, holatlari va follow-up sanalari.</p>
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as CrmLeadStatus | "all")}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-blue-500"
        >
          <option value="all">Barcha leadlar</option>
          <option value="new">Yangi</option>
          <option value="contacted">Bog'lanildi</option>
          <option value="won">Mijoz bo'ldi</option>
          <option value="lost">Yo'qotildi</option>
        </select>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Usta chaqirish so'rovlari</h2>
            <p className="text-sm text-slate-500">Mijoz yuborgan ish so'rovlari.</p>
          </div>
          <select
            value={jobStatus}
            onChange={(event) => setJobStatus(event.target.value as JobStatus | "all")}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-blue-500"
          >
            <option value="all">Barcha statuslar</option>
            <option value="new">Yangi</option>
            <option value="contacted">Bog'lanildi</option>
            <option value="assigned">Ustaga berildi</option>
            <option value="done">Bajarildi</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {jobsLoading ? (
            <div className="h-56 bg-slate-100 animate-pulse" />
          ) : filteredJobs.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-500">So'rov topilmadi</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className={`grid grid-cols-1 gap-4 p-5 lg:grid-cols-[1fr_170px] lg:items-start ${
                    job.status === "new" ? "bg-blue-50/70" : "bg-white"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {job.status === "new" ? (
                        <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-black text-white">
                          NEW
                        </span>
                      ) : null}
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        {job.category}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                        {job.district}
                      </span>
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                        {jobStatusLabels[job.status]}
                      </span>
                    </div>
                    <a
                      href={`tel:${job.phone.replace(/\s/g, "")}`}
                      className="text-sm font-bold text-blue-700 hover:text-blue-800"
                    >
                      {job.phone}
                    </a>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{job.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-400">
                      <span>{new Date(job.createdAt).toLocaleString("uz-UZ")}</span>
                      {job.imageUrl ? (
                        <a
                          href={job.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-blue-600 hover:text-blue-700"
                        >
                          Rasmni ko'rish
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <select
                    value={job.status}
                    onChange={(event) => changeJobStatus(job.id, event.target.value as JobStatus)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500"
                  >
                    {Object.entries(jobStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
          <input
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            placeholder="Mijoz ismi"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500"
          />
          <input
            value={draft.phone}
            onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
            placeholder="+998..."
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500"
          />
          <input
            value={draft.source}
            onChange={(event) => setDraft({ ...draft, source: event.target.value })}
            placeholder="Source"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500"
          />
          <input
            type="date"
            value={draft.nextFollowUp ?? ""}
            onChange={(event) => setDraft({ ...draft, nextFollowUp: event.target.value || null })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500"
          />
          <button
            onClick={createLead}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4" /> Qo'shish
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-72 bg-slate-100 animate-pulse" />
        ) : filteredLeads.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">Lead topilmadi</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="grid grid-cols-1 gap-3 p-5 xl:grid-cols-[1fr_180px_160px_150px_120px] xl:items-center">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <input
                    value={lead.name}
                    onChange={(event) => patchLead(lead.id, { name: event.target.value })}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500"
                  />
                  <input
                    value={lead.phone}
                    onChange={(event) => patchLead(lead.id, { phone: event.target.value })}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500"
                  />
                  <input
                    value={lead.note}
                    onChange={(event) => patchLead(lead.id, { note: event.target.value })}
                    placeholder="Izoh"
                    className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500"
                  />
                </div>
                <input
                  value={lead.source}
                  onChange={(event) => patchLead(lead.id, { source: event.target.value })}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500"
                />
                <select
                  value={lead.status}
                  onChange={(event) => patchLead(lead.id, { status: event.target.value as CrmLeadStatus })}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={lead.nextFollowUp ?? ""}
                  onChange={(event) => patchLead(lead.id, { nextFollowUp: event.target.value || null })}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500"
                />
                <div className="flex gap-2 xl:justify-end">
                  <button onClick={() => saveLead(lead)} className="rounded-xl bg-blue-600 p-2.5 text-white hover:bg-blue-700">
                    <Save className="h-4 w-4" />
                  </button>
                  <button onClick={() => removeLead(lead.id)} className="rounded-xl bg-rose-50 p-2.5 text-rose-600 hover:bg-rose-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
