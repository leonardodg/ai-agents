import React from 'react'
import { useEffect, useRef } from 'react'

import LordiconPlayer from '~/components/LordiconPlayer';

const ICON_WARNING = '/icons/warning.json';
const ICON_ERROR = '/icons/error.json';
const ICON_SUCCESS = '/icons/check-pinch.json';

interface Suggestion {
    type: "good" | "improve";
    tip: string;
}

interface ATSProps {
    score: number;
    suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {

    const playerRef = useRef<any>(null);

    useEffect(() => {
        playerRef.current?.playFromBeginning();
    }, [])

    // Determine background gradient based on score
    const gradientClass = score > 69
        ? 'from-green-100'
        : score > 49
            ? 'from-yellow-100'
            : 'from-red-100';

    // Determine icon based on score
    const iconScore = score > 69
        ? (<LordiconPlayer
            ref={playerRef}
            size={24}
            iconUrl={ICON_SUCCESS}
            colorize="#66eece"
        />)
        : score > 49
            ? (<LordiconPlayer
                    ref={playerRef}
                    size={24}
                    iconUrl={ICON_WARNING}
                    colorize="#eeaa66"
                />)
            : (<LordiconPlayer
                ref={playerRef}
                size={24}
                iconUrl={ICON_ERROR}
                colorize="#e83a30"
            />);

    // Determine subtitle based on score
    const subtitle = score > 69
        ? 'Great Job!'
        : score > 49
            ? 'Good Start'
            : 'Needs Improvement';

    return (
        <div className={`bg-gradient-to-b ${gradientClass} to-white rounded-2xl shadow-md w-full p-6`}>
            {/* Top section with icon and headline */}
            <div className="flex items-center gap-4 mb-6">
                
                {iconScore}

                <div>
                    <h2 className="text-2xl font-bold">ATS Score - {score}/100</h2>
                </div>
            </div>

            {/* Description section */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{subtitle}</h3>
                <p className="text-gray-600 mb-4">
                    This score represents how well your resume is likely to perform in Applicant Tracking Systems used by employers.
                </p>

                {/* Suggestions list */}
                <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-3">
                            {suggestion.type === "good" ? (<LordiconPlayer
                                    ref={playerRef}
                                    size={24}
                                    iconUrl={ICON_SUCCESS}
                                    colorize="#66eece"
                                />) : (<LordiconPlayer
                                    ref={playerRef}
                                    size={24}
                                    iconUrl={ICON_WARNING}
                                    colorize="#eeaa66"
                                />) }

                            <p className={suggestion.type === "good" ? "text-green-700" : "text-amber-700"}>
                                {suggestion.tip}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Closing encouragement */}
            <p className="text-gray-700 italic">
                Keep refining your resume to improve your chances of getting past ATS filters and into the hands of recruiters.
            </p>
        </div>
    )
}

export default ATS