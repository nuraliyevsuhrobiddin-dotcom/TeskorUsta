"use client";

import { useEffect, useMemo, useState } from "react";
import { Save, ShieldCheck, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { AdminUser, fetchAdminUsers, updateAdminUser } from "@/lib/supabase/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    setUsers(await fetchAdminUsers());
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    return users.filter((user) =>
      [user.email, user.name, user.phone].some((value) => value.toLowerCase().includes(normalizedSearch))
    );
  }, [search, users]);

  const patchUser = (id: string, patch: Partial<AdminUser>) => {
    setUsers((current) => current.map((user) => (user.id === id ? { ...user, ...patch } : user)));
  };

  const saveUser = async (user: AdminUser) => {
    const success = await updateAdminUser(user.id, {
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });

    if (success) toast.success("Foydalanuvchi saqlandi");
    else toast.error("Foydalanuvchini saqlab bo'lmadi");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Foydalanuvchilar</h1>
          <p className="text-sm text-slate-500">Profil, rol va blok holatini boshqarish.</p>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Email, ism yoki telefon..."
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-72 bg-slate-100 animate-pulse" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">User</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Kontakt</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Rol</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500 text-right">Saqlash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          {user.role === "admin" ? <ShieldCheck className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
                        </div>
                        <div>
                          <input
                            value={user.name}
                            onChange={(event) => patchUser(user.id, { name: event.target.value })}
                            placeholder="Ism"
                            className="w-48 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
                          />
                          <p className="mt-1 text-xs text-slate-400">{new Date(user.createdAt).toLocaleDateString("uz-UZ")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-700">{user.email}</p>
                      <input
                        value={user.phone}
                        onChange={(event) => patchUser(user.id, { phone: event.target.value })}
                        placeholder="+998..."
                        className="mt-2 w-44 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={user.role}
                        onChange={(event) => patchUser(user.id, { role: event.target.value as AdminUser["role"] })}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold outline-none focus:border-blue-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={user.status}
                        onChange={(event) => patchUser(user.id, { status: event.target.value as AdminUser["status"] })}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold outline-none focus:border-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => saveUser(user)}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4" /> Saqlash
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
