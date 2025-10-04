import type { Route } from "../+types/home";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import Navbar from "~/components/Navbar";
import HomeResumind from "~/components/HomeResumind";
import ResumeCard from "~/components/ResumeCard";

import { usePuterStore } from "~/libs/puter";
import { resumes } from "../../../constants";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind | AI Home" },
    { name: "description", content: "Smart feedback for you dream job!" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate('/auth?next=/resumind');
  }, [auth.isAuthenticated])


  return (
    <main className="bg-[url('/images/background_Friendly_Robot.jpg')] bg-cover min-h-screen flex flex-col">
        <Navbar />
        <HomeResumind />

          <section className="flex flex-1 justify-center items-center">
                { resumes.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 text-center font-semibold gap-4">
                      {resumes.map((resume) => (
                        <ResumeCard key={resume.id} resume={resume} />
                      ))}
                    </div>
                )}
          </section>
    </main>
  )
}
