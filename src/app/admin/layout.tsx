import "./admin.css";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin Console — NexCreator Ops",
  description: "Enterprise Operations Console for NexCreator Administrators",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root">
      <AdminSidebar />
      <div className="admin-main">
        {children}
      </div>
    </div>
  );
}
