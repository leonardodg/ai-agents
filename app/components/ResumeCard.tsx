import { Link } from "react-router"
import ScoreGauge from "./ScoreGauge"
import ScoreCircle from "./ScoreCircle"

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume}) => {
    return (

        <Link to={`/resumind/resume/${id}`} className="resume-card animate-in fade-in duration-1000 mx-auto p-4 bg-white bg-opacity-80 rounded-lg shadow-md my-4 block hover:bg-blue-50 transition"> 
                
            <div key={id} className="resume-card-header">
                <div className="flex flex-col gap-2">
                    {companyName && <h2 className="!text-black font-bold break-words">{companyName}</h2>}
                    {jobTitle && <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>}
                    {!companyName && !jobTitle && <h2 className="!text-black font-bold">Resume</h2>}
                </div>

                <div className="flex-shrink-0">
                    <ScoreCircle score={feedback.overallScore} />
                </div>
            </div>

            {imagePath && ( 
                <div className="animate-in fade-in duration-1000" >
                    <div className="w-full h-full">
                        <img
                            src={imagePath}
                            alt="resume"
                            className="w-full h-[350px] max-sm:h-[210px] object-cover object-top"
                        />
                    </div>
                </div>
            )}
        </Link>
    )
}

export default ResumeCard