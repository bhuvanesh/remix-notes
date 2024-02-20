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
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-violet-500 to-violet-700">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat">
        <img
          src="https://media3.giphy.com/media/tIHktzgRi8yjIplFVI/giphy.gif?cid=6c09b952wc436dbdl7tda7uh1ojffdswzqtwjnr063cr6qu1&ep=v1_gifs_search&rid=giphy.gif&ct=s"
          alt="Snow Falling"
          className="w-full h-full opacity-50"
        />
      </div>
      <div className="text-white">
        <h1 className="text-4xl font-bold">This is the admin dashboard</h1>
        <p className="mt-4">This page is restricted to users with the 'admin' role.</p>
      </div>
    </div>
  );
}