import { Link } from '@remix-run/react';
import { UserButton } from "@clerk/remix";
import { getAuth } from "@clerk/remix/ssr.server";
import { redirect } from "@remix-run/node";
 
export const loader = async (args) => {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/sign-in");
  }
  return {};
}
export default function Index() {
  return (
    <main id="content" className="bg-gradient-to-b from-violet-500 to-violet-700 flex items-center justify-center h-screen">
      <div className="grid place-items-center">
      <UserButton afterSignOutUrl="/"/>
        <h1 className="text-white text-sm md:text-lg lg:text-xl">A better way of keeping track of your notes</h1>
        <p className="text-white text-xs md:text-sm lg:text-base mb-4">Try our early beta and never lose track of your notes again!</p>
        <p id="cta">
          <Link to="/notes" className="text-white bg-transparent border border-white rounded px-4 py-2 hover:bg-white hover:text-violet-500 mt-4">
            Try Now!
          </Link>
        </p>
      </div>
    </main>
  );
}
