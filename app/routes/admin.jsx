import { createClerkClient } from "@clerk/remix/api.server";
import { useLoaderData,Link } from "@remix-run/react";
import { json } from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import { redirect } from "@remix-run/node";




export const loader = async (args) => {
  const { sessionClaims } = await getAuth(args);

  // If the user does not have the admin role, redirect them to the home page
  if (sessionClaims?.metadata.role !== "admin") {
      return redirect("/");
    console.log(sessionClaims?.metadata.role);
    
  }
  const client = createClerkClient({ secretKey: "sk_test_egdKQtEMkEIe4T2YwdvevFFPWvpHqkjZdQ3MxyiW3i" });
  const userList = await client.users.getUserList();
  return json(userList);
}


export default function SomePage() {
  const data = useLoaderData();

  return (
    <div className="container mx-auto">
      <table className="table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">UserID</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => (
            <tr key={user.id}>
              <td className="border px-4 py-2">
              <Link to={`/admin/${user.id}`}>{user.id}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}