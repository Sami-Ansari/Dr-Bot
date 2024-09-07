"use client";
import React, { useContext } from "react";
import {
  CircleUserRound,
  Compass,
  Lightbulb,
  Youtube,
  Code,
  SendHorizontal,
  Settings,
} from "lucide-react";
import Image from "next/image";

import { useChat } from "ai/react";
import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';


export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: 'api/test',
    onError: (e) => {
      console.error('Error:', e);
    }
  });

  const chatParent = useRef(null);


  useEffect(() => {
    const domNode = chatParent.current;
    if (domNode) {
      domNode.scrollTop = domNode.scrollHeight;
    }
  }, [messages]);


  return (
    <>
      <div className="flex-1 min-h-[100vh] pb-[15vh] relative ">
        <div className="flex items-center justify-between p-5 text-xl text-gray-400">
          <p>Dr Bot</p>
          <CircleUserRound size={40} className="text-softTextColor" />
        </div>
        <div className="max-w-[900px] m-auto">
          {messages.length == 0 ? (
            <>
              <div className="my-12 text-5xl font-medium p-5">
                <p>
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    Hello, Sami
                  </span>
                </p>
                <p className="text-[#444746]">How can I help you today?</p>
              </div>
              <div className=" md:grid md:grid-cols-4 gap-5 p-5 flex flex-nowrap mx-auto w-full  overflow-x-auto  mb-10 text-white ">
                <div className="h-32 w-60 sm:h-48 sm:w-60 md:w-auto md:h-auto p-4  shrink-0 bg-[#1E1F20] border-transparent border rounded-xl relative cursor-pointer">
                  <p>Suggest beautiful places to see on an upcoming road trip</p>
                  <Compass
                    size={35}
                    className="p-1 absolute bottom-2 right-2 bg-bgPrimaryColor text-softTextColor rounded-full"
                  />
                </div>
                <div className="h-32 w-60 sm:h-48 sm:w-60 md:w-auto md:h-auto p-4 shrink-0 bg-[#1E1F20] border-transparent border  rounded-xl relative cursor-pointer">
                  <p>What’s the reaction to and impact of autonomous vehicles</p>
                  <Lightbulb
                    size={35}
                    className="p-1 absolute bottom-2 right-2 bg-bgPrimaryColor text-softTextColor rounded-full"
                  />
                </div>
                <div className="h-32 w-60 sm:h-48 sm:w-60 md:w-auto md:h-autop-4 shrink-0 bg-[#1E1F20] border-transparent border  rounded-xl relative cursor-pointer">
                  <p>Come up with a recipe for an upcoming event</p>
                  <Youtube
                    size={35}
                    className="p-1 absolute bottom-2 right-2 bg-bgPrimaryColor text-softTextColor rounded-full"
                  />
                </div>
                <div className="h-32 w-60 sm:h-48 sm:w-60 md:w-auto md:h-auto p-4 shrink-0 bg-[#1E1F20] border-transparent border  rounded-xl relative cursor-pointer">
                  <p>Evaluate and rank common camera categories</p>
                  <Code
                    size={35}
                    className="p-1 absolute bottom-2 right-2 bg-bgPrimaryColor text-softTextColor rounded-full"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="result container">
              <div className=" flex gap-5">

                {/* Display user messages */}
                <ul ref={chatParent} className="text-md font-normal leading-6 text-gray-400 ">
                  {messages.map((message, index) => (
                    message.role === 'user' && (
                      <>
                      <div className="flex  mt-5    items-center justify-end gap-2">
                        
                      <li key={index} className="flex ">
                        <div className="rounded-xl p-2 md:p-4 bg-background shadow-md ">
                          <p className="text-white">
                            {message.content}
                          </p>
                        </div>
                      </li>
                      <div  className="flex-nowrap">
                      <CircleUserRound size={40} className="text-softTextColor" />
                        </div>
                      </div>
                      </>
                    )
                    ||  message.role !== 'user'&& (
                      <div className="flex  items-start justify-between mt-5  gap-2">
                        <div className="flex-nowrap pt-2">
                     <Image  width={50} height={50} src="/gemini.png" alt="Gemini"  />
                     </div>
                      <li key={index} className=" w-11/12">
                      <div className="rounded-xl p-2 md:p-4 bg-background shadow-md  ">
                        <p className="text-white">
                          <ReactMarkdown>
                            {message.content}
                          </ReactMarkdown>
                        </p>
                      </div>
                    </li>
                     
                     
                    </div>
                    )

                  ))}
                </ul>
              </div>

             
            </div>

          )}
          <div className="absolute bottom-0 w-full max-w-[900px] px-5 m-auto">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between gap-5 bg-[#1E1F20] py-2.5 px-5 rounded-full">
                <input
                  onChange={handleInputChange}

                  value={input}
                  type="text"
                  className="flex-1 bg-transparent border-none outline-none p-2 text-md text-gray-400"
                  placeholder="Enter a prompt here"
                />
                <div className="flex cursor-pointer text-white">
                  <SendHorizontal type="submit" size={20} />
                </div>
              </div>
            </form>
            <p className="text-gray-400 text-sm text-center p-3">
              {/* Gemini may display inaccurate info, including about people, so
              double-check its responses. Your privacy and Gemini Apps */}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
