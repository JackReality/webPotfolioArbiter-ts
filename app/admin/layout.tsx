export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Administration</h1>
      {children}
    </div>
  );
}
