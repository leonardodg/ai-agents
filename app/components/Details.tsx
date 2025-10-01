import { cn } from "~/libs/utils";
import {
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionItem,
} from "./Accordion";

import { useEffect, useRef } from 'react';

import LordiconPlayer from '~/components/LordiconPlayer';

const ICON_WARNING = '/icons/warning.json';
const ICON_ERROR = '/icons/error.json';
const ICON_SUCCESS = '/icons/check-pinch.json';


const ScoreBadge = ({ score }: { score: number }) => {

    const playerRef = useRef<any>(null);

    useEffect(() => {
        playerRef.current?.playFromBeginning();
    }, [])

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

    
    return (
        <div
            className={cn(
                "flex flex-row gap-1 items-center px-2 py-0.5 rounded-[96px]",
                score > 69
                    ? "bg-badge-green"
                    : score > 39
                        ? "bg-badge-yellow"
                        : "bg-badge-red"
            )}
        >
            {iconScore}

            <p
                className={cn(
                    "text-sm font-medium",
                    score > 69
                        ? "text-badge-green-text"
                        : score > 39
                            ? "text-badge-yellow-text"
                            : "text-badge-red-text"
                )}
            >
                {score}/100
            </p>
        </div>
    );
};

const CategoryHeader = ({
    title,
    categoryScore,
}: {
    title: string;
    categoryScore: number;
}) => {
    return (
        <div className="flex flex-row gap-4 items-center py-2">
            <p className="text-2xl font-semibold">{title}</p>
            <ScoreBadge score={categoryScore} />
        </div>
    );
};

const CategoryContent = ({
    tips,
}: {
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => {
    const playerRef = useRef<any>(null);

    useEffect(() => {
        playerRef.current?.playFromBeginning();
    }, [])

    return (
        <div className="flex flex-col gap-4 items-center w-full">
            <div className="bg-gray-50 w-full rounded-lg px-5 py-4 grid grid-cols-2 gap-4">
                {tips.map((tip, index) => (
                    <div className="flex flex-row gap-2 items-center" key={index}>

                        { tip.type === "good" ? (<LordiconPlayer
                            ref={playerRef}
                            size={24}
                            iconUrl={ICON_SUCCESS}
                            colorize="#66eece"
                        />) : (<LordiconPlayer
                            ref={playerRef}
                            size={24}
                            iconUrl={ICON_WARNING}
                            colorize="#eeaa66"
                        />)}

                        <p className="text-xl text-gray-500 ">{tip.tip}</p>
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-4 w-full">
                {tips.map((tip, index) => (
                    <div
                        key={index + tip.tip}
                        className={cn(
                            "flex flex-col gap-2 rounded-2xl p-4",
                            tip.type === "good"
                                ? "bg-green-50 border border-green-200 text-green-700"
                                : "bg-yellow-50 border border-yellow-200 text-yellow-700"
                        )}
                    >
                        <div className="flex flex-row gap-2 items-center">
                            {tip.type === "good" ? (<LordiconPlayer
                                ref={playerRef}
                                size={24}
                                iconUrl={ICON_SUCCESS}
                                colorize="#66eece"
                            />) : (<LordiconPlayer
                                ref={playerRef}
                                size={24}
                                iconUrl={ICON_WARNING}
                                colorize="#eeaa66"
                            />)}
                            <p className="text-xl font-semibold">{tip.tip}</p>
                        </div>
                        <p>{tip.explanation}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Details = ({ feedback }: { feedback: Feedback }) => {
    return (
        <div className="flex flex-col gap-4 w-full">
            <Accordion>
                <AccordionItem id="tone-style">
                    <AccordionHeader itemId="tone-style">
                        <CategoryHeader
                            title="Tone & Style"
                            categoryScore={feedback.toneAndStyle.score}
                        />
                    </AccordionHeader>
                    <AccordionContent itemId="tone-style">
                        <CategoryContent tips={feedback.toneAndStyle.tips} />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem id="content">
                    <AccordionHeader itemId="content">
                        <CategoryHeader
                            title="Content"
                            categoryScore={feedback.content.score}
                        />
                    </AccordionHeader>
                    <AccordionContent itemId="content">
                        <CategoryContent tips={feedback.content.tips} />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem id="structure">
                    <AccordionHeader itemId="structure">
                        <CategoryHeader
                            title="Structure"
                            categoryScore={feedback.structure.score}
                        />
                    </AccordionHeader>
                    <AccordionContent itemId="structure">
                        <CategoryContent tips={feedback.structure.tips} />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem id="skills">
                    <AccordionHeader itemId="skills">
                        <CategoryHeader
                            title="Skills"
                            categoryScore={feedback.skills.score}
                        />
                    </AccordionHeader>
                    <AccordionContent itemId="skills">
                        <CategoryContent tips={feedback.skills.tips} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default Details;