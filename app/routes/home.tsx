import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import Welcome from "~/components/Welcome";
import Chat from "~/components/Chat";


import { FaBeer } from 'react-icons/fa';
import { DiJsBadge } from "react-icons/di";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Customer AI Agent" },
    { name: "description", content: "Welcome AI Agent in React Router!" },
  ];
}

export default function Home() {
  return <main className="bg-[url('/images/background_Friendly_Robot.jpg')] bg-cover">
            <Navbar />
            <Welcome />
            <Chat />

            <h3 className="flex justify-center" > Lets go for a <FaBeer />? </h3>
        </main>;
}
