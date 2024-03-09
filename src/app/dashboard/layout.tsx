
import SideNav from "./sideNav";


export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="container mx-auto pt-12">
      <div className="flex md:gap-8 gap-2 mb-12 w-full">
          <SideNav />
       <div className="md:w-full w-auto">
          {children}
        </div>  
       </div>  
    </main>
  );
}
