import type { Route } from "../+types/home";
import Navbar from "~/components/Navbar";
import HomeResumind from "~/components/HomeResumind";

import { usePuterStore } from "~/libs/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import ResumeCard from "~/components/ResumeCard";
import { resumes } from "../../../constants";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind | AI Agent" },
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


  return <main className="bg-[url('/images/background_Friendly_Robot.jpg')] bg-cover">

    <Navbar />
    <HomeResumind />

    { resumes.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 resume-section text-center font-semibold">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
    )}

  </main>;
}
