import config from "../utils/cdb.server";
import pkg from "pg";
const { Pool } = pkg;
const pool = new Pool(config);
import { useLoaderData } from "@remix-run/react";

export const loader = async () => {
  return pool.query("SELECT * FROM reply").then((res) => {
    return res.rows;
  });
}

export default function Temp1() {
  const data = useLoaderData();
  console.log("data",data); 
  return (
    <div>
      <h1>Reply</h1>
      <ul>
        {data.map((reply) => (
          <li key={reply.id}>{reply.reply}</li>
        ))}
      </ul>
    </div>
  );
}
