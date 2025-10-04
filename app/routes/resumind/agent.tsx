import { type FormEvent, useState, useEffect, useRef } from 'react'
import type { Route } from "../+types/home";
import { useNavigate } from "react-router";

import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import LordiconPlayer from '~/components/LordiconPlayer';

import { usePuterStore } from "~/libs/puter";
import { convertPdfToImage } from "~/libs/pdf2img";
import { generateUUID } from "~/libs/utils";
import { prepareInstructions } from "../../../constants";

const ICON_ARTICLE = '/icons/article.json';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind | AI Agent" },
    { name: "description", content: "Smart feedback for you dream job!" },
  ];
}

const Agent = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const playerRef = useRef<any>(null);

    useEffect(() => {
        playerRef.current?.playFromBeginning();
    }, [])

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File }) => {
        setIsProcessing(true);

        setStatusText('Uploading the file...');
        const uploadedFile = await fs.upload([file]);
        if (!uploadedFile) return setStatusText('Error: Failed to upload file');

        setStatusText('Converting to image...');
        const imageFile = await convertPdfToImage(file);
        if (!imageFile.file) return setStatusText('Error: Failed to convert PDF to image');

        setStatusText('Uploading the image...');
        const uploadedImage = await fs.upload([imageFile.file]);
        if (!uploadedImage) return setStatusText('Error: Failed to upload image');

        setStatusText('Preparing data...');
        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName, jobTitle, jobDescription,
            feedback: '',
        }
        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText('Analyzing...');

        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({ jobTitle, jobDescription })
        )
        if (!feedback) return setStatusText('Error: Failed to analyze resume');

        const feedbackText = typeof feedback.message.content === 'string'
            ? feedback.message.content
            : feedback.message.content[0].text;

        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText('Analysis complete, redirecting...');
        console.log(data);
        navigate(`/resumind/resume/${uuid}`);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/background_Friendly_Robot.jpg')] bg-cover min-h-screen flex flex-col">
            <Navbar />

            <section className="main-section">
                <div className="page-heading md:py-8 max-w-2xl mx-auto text-center">
                    <h1 className="text-4xl font-light bg-gradient-to-r from-emerald-400 via-sky-300 to-blue-500 bg-clip-text text-transparent text-center">Smart feedback for your dream job</h1>
                    <h2>Drop your resume for an ATS score and improvement tips</h2>
                </div>
            </section>

            <section className="flex flex-1 justify-center items-center">
                <div className="text-center w-full max-w-md">
                   
                    {isProcessing ? (
                    <>
                        <h2>{statusText}</h2>
                        <LordiconPlayer
                        ref={playerRef}
                        size={48}
                        iconUrl={ICON_ARTICLE}
                        colorize="#121331"
                        />
                    </>
                    ) : (
                    <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                        <div className="form-div">
                        <label htmlFor="company-name">Company Name</label>
                        <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                        </div>
                        <div className="form-div">
                        <label htmlFor="job-title">Job Title</label>
                        <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                        </div>
                        <div className="form-div">
                        <label htmlFor="job-description">Job Description</label>
                        <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                        </div>

                        <div className="form-div">
                        <label htmlFor="uploader">Upload Resume</label>
                        <FileUploader onFileSelect={handleFileSelect} />
                        </div>
                        <div className="flex justify-center items-center w-full">
                        <button
                            className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
                            type="submit"
                        >
                            Analyze Resume
                        </button>
                        </div>
                    </form>
                    )}
                </div>
            </section>
        </main>
    )
}
export default Agent