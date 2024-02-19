import { getAuth } from "@clerk/remix/ssr.server";
import { redirect } from "@remix-run/node";


export const loader = async (args) => {
    const { sessionClaims } = await getAuth(args);
 
    // If the user does not have the admin role, redirect them to the home page
    if (sessionClaims?.metadata.role !== "admin") {
        return redirect("/");
      console.log(sessionClaims?.metadata.role);
      
    }
    return null;
   
};
 
export default function AdminDashboard() {

  return (
    <>
      <h1>This is the admin dashboard</h1>      
      <p>This page is restricted to users with the 'admin' role.</p>
    </>
  );
}