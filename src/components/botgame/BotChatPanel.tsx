
import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@mantine/core";
import * as classes from "./BotGamePage.css";

export interface ChatMessage {
    id: string;
    sender: "bot" | "user" | "system";
    text: string;
    timestamp: number;
}

interface BotChatPanelProps {
    messages: ChatMessage[];
    botName: string;
}

export const BotChatPanel: React.FC<BotChatPanelProps> = ({ messages, botName }) => {
    const viewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll to bottom
        if (viewportRef.current) {
            viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className={classes.chatContainer}>
            <ScrollArea className={classes.chatMessages} viewportRef={viewportRef}>
                {messages.length === 0 && (
                    <div className={classes.systemMessage}>
                        Game started vs {botName}
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`${classes.messageBubble} ${msg.sender === "bot"
                                ? classes.botMessage
                                : msg.sender === "system"
                                    ? classes.systemMessage
                                    : "" // User message style (if we add user chat)
                            }`}
                    >
                        {msg.sender === "bot" && <strong>{botName}: </strong>}
                        {msg.text}
                    </div>
                ))}
            </ScrollArea>
        </div>
    );
};
