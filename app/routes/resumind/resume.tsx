import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState, useRef } from "react";

import { usePuterStore } from "~/libs/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

import LordiconPlayer from '~/components/LordiconPlayer';
import Navbar from "~/components/Navbar";

const ICON_ARROW = '/icons/arrow-right.json';
const ICON_ARTICLE = '/icons/article.json';

export const meta = () => ([
    { title: 'Resumind | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams(); // GET resume id from URL
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const navigate = useNavigate();

    const playerRef = useRef<any>(null);

    useEffect(() => {
        playerRef.current?.playFromBeginning();
    }, [])

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resumind/resume/${id}`);
    }, [isLoading])

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);

            if (!resume) return;

            const data = JSON.parse(resume);

            const resumeBlob = await fs.read(data.resumePath);
            if (!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            const imageBlob = await fs.read(data.imagePath);
            if (!imageBlob) return;
            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);

            setFeedback(data.feedback);
            console.log({ resumeUrl, imageUrl, feedback: data.feedback });
        }

        loadResume();
    }, [id]);

    return (
            <main className="bg-[url('/images/background_Friendly_Robot.jpg')] bg-cover min-h-screen flex flex-col">
            <Navbar />

            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section h-[100vh] items-center justify-center">
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="resume"
                                />
                            </a>
                        </div>
                    )}
                </section>
                <section className="feedback-section">
                    <h1 className="text-4xl font-light bg-gradient-to-r from-emerald-400 via-sky-300 to-blue-500 bg-clip-text text-transparent text-center"> Resume Review </h1>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                            <div className="flex justify-center items-center w-full">
                                <LordiconPlayer
                                    ref={playerRef}
                                    size={48}
                                    iconUrl={ICON_ARTICLE}
                                    colorize="#121331"
                                />
                            </div>
                    )}
                </section>
            </div>
        </main>
    )
}
export default Resume