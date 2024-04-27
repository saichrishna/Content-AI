"use client";
import React, { useEffect, useState } from "react";
import styles from "@/styles/RightSection.module.css";
import chatgptlogo from "@/assets/chatgptlogo.png";
import Logo from "@/assets/Logo.png";
import nouserlogo from "@/assets/nouserlogo.png";
import Image from "next/image";
// import schoolbg from '@/assets/schoolBG.jpg'
import { HashLoader } from "react-spinners";
import { debug } from "console";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API;
// console.log(API_KEY)
const RightSection = () => {
  const trainingPrompt = [
    {
      role: "user",
      parts: [
        {
          text: "This is Introductory dialogue for any prompt :  'Hello, my dear friend, I am the Spotcheck Bot. Ask me anything regarding procurement, purchase, and logistics. I will be happy to help you. '",
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: "okay",
        },
      ],
    },
    {
      role: "user",
      parts: [
        {
          text: "Special Dialogue 1 : if any prompt mentions 'Shashi Shahi' word :  'Ofcourse! Dr. Shashi Shahi is one of the prominent professors at UWindsor! He is an IIT-D alumni with year of invaluable experience and a fun way of engaging in lectures!' 'Likes: Analytics and Research and Case Studies ''Dislikes: Students near riverside.'",
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: "okay",
        },
      ],
    },
    {
      role: "user",
      parts: [
        {
          text: "Special Dialogue 2 : Any prompt that mentions CHATGPT class / classroom  A : ' The CHATGPT Batch of 2023 is by far the best the university has ever seen by all sets of standards. Students from different come together to form a truly diverse and culturally rich classroom experience. I believe that all students are highly capable and will achieve all great things in their professional career!' ",
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: "okay",
        },
      ],
    },
  ];
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [threadId, setThreadId] = useState("");
  const [data, setData] = useState("");
  const [botMsg, setBotMessage] = useState("");
  const [latestMessageIndex, setlatestMessageIndex] = useState(0);
  const [latestMessage, setlatestMessage] = useState("");
  const [gotAnswer, setGotAnswer] = useState(false);

  useEffect(() => {
    getThreadId();
  }, []);

  useEffect(() => {
    if (
      allMessages[allMessages.length - 1] &&
      allMessages[allMessages.length - 1].role === "user"
    ) {
      setlatestMessageIndex(allMessages.length);
      setlatestMessage("");
    }

    // allMessages[latestMessageIndex];
  }, [allMessages]);
  useEffect(() => {
    let index = latestMessageIndex;
    if (latestMessageIndex > 0 && latestMessage.length > 0) {
      setAllMessages((prevMessages) => {
        // Create a copy of the previous messages array
        const newMessages = [...prevMessages];
        // Update the content of the latest message in the copied array
        newMessages[latestMessageIndex] = {
          ...newMessages[latestMessageIndex], // Preserve other properties of the message
          content: latestMessage,
          role: "bot",
        };
        return newMessages;
      });
    }
  }, [latestMessage, latestMessageIndex]);
  const getThreadId = async () => {
    const response = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to create thread");
    }
    const threadId = await response.json();
    setThreadId(threadId.id);
  };
  let concatenatedString = "";
  const sendMessage = async () => {
    setIsSending(true);
    if (threadId !== "") {
      try {
        const messageResponse = await fetch(
          `https://api.openai.com/v1/threads/${threadId}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
              "OpenAI-Beta": "assistants=v2",
            },
            body: JSON.stringify({
              role: "user",
              content: message,
            }),
          }
        );

        if (!messageResponse.ok) {
          throw new Error("Failed to send message");
        }

        const { id, content } = await messageResponse.json();
        const newMessage = { content: content[0].text.value, role: "user" };
        if (content.length > 0) {
          setAllMessages((prevMessages) => [...prevMessages, newMessage]);
          // setlatestMessageIndex((prevIndex) => prevIndex + 2);
          setMessage("");
          try {
            const runResponse = await fetch(
              `https://api.openai.com/v1/threads/${threadId}/runs`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${API_KEY}`,
                  "Content-Type": "application/json",
                  "OpenAI-Beta": "assistants=v2",
                },
                body: JSON.stringify({
                  stream: true,
                  tool_choice: null,
                  // assistant_id: "asst_7orTXyhUqldCdI28epppJpVx",
                  assistant_id: "asst_9KX7hWbvy2D6tvgsSra04U5r",
                }),
              }
            );

            if (!runResponse.ok) {
              throw new Error("Failed to send message");
            }
            const reader = await runResponse.body?.getReader();
            const processStream = async () => {
              try {
                // const reader = runResponse.body.getReader();
                let buffer = ""; // Buffer for incomplete JSON data
                let events = []; // Array to store parsed JSON objects
                var answer = "";
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) {
                    console.log("Stream complete");
                    console.log(answer);
                    // const newMessage = { content: answer, role: "bot" };
                    // setAllMessages((prevMessages) => [
                    //   ...prevMessages,
                    //   newMessage,
                    // ]);
                    break;
                  }
                  buffer = new TextDecoder().decode(value); // Append new data to buffer
                  let lines = buffer.split("\n"); // Split buffer into lines
                  const dataArray = [];

                  for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line.startsWith("data:")) {
                      const jsonDataString = line
                        .substring("data:".length)
                        .trim();
                      if (jsonDataString !== "[DONE]") {
                        try {
                          const jsonData = JSON.parse(jsonDataString);
                          jsonData.object === "thread.message.delta"
                            ? dataArray.push(jsonData)
                            : null;
                        } catch (error) {
                          console.error("Error parsing JSON:", error);
                        }
                      }
                    }
                  }

                  // let latestMessageIndex = allMessages.length
                  //   ? allMessages.length - 1
                  //   : 0;
                  // const latestMessage =
                  //   latestMessageIndex >= 0
                  //     ? allMessages[latestMessageIndex]
                  //     : { content: "", role: "bot" };
                  // Process events array after each chunk is read
                  for (const event of dataArray) {
                    concatenatedString += event.delta.content[0].text.value;
                    setlatestMessage(concatenatedString);
                    // lat  estMessage.content +=
                    // answer += event.delta.content[0].text.value;
                    // const newMessage = { content: answer, role: "bot" };
                    // setAllMessages((prevMessages) => [
                    //   newMessage,
                    //   ...prevMessages,
                    // ]);
                  }

                  // const newMessage = { content: "", role: "bot" };
                  // concatenatedString.length > 0
                  //   ? setAllMessages((prevMessages) => [
                  //       ...prevMessages,
                  //       newMessage,
                  //     ])
                  //   : null;
                }
              } catch (error) {
                console.error("Error reading stream:", error);
              }
            };
            processStream();
          } catch (error) {
            console.error("Error sending message:", error);
          }
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }

    setIsSending(false);
  };

  // const sendMessage = async () => {

  //     // let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=` + API_KEY
  //     let url = `https://api.openai.com/v1/chat/completions`
  //     let token = `Bearer ${API_KEY}`;
  //     let headers = {
  //       'Authorization': token,
  //       'Content-Type': 'application/json'
  //     };
  //     let messagesToSend = {
  //         prompt: trainingPrompt,
  //         max_tokens: 1000,  // Optional: Set the maximum response length
  //         n: 1,              // Optional: Number of responses to generate (set to 1)
  //         temperature: 0.7,   // Optional: Controls randomness of the response (0-1)
  //       };

  //     setIsSent(false)
  //     let res = await fetch(url, {
  //         method: 'POST',
  //         headers: {
  //             'Content-Type': 'application/json'
  //         },
  //         body: JSON.stringify({
  //             "contents": messagesToSend
  //         })
  //     })

  //     let resjson = await res.json()
  //     setIsSent(true)
  //     // console.log(resjson.candidates[0].content.parts[0].text)

  //     let responseMessage = resjson.candidates[0].content.parts[0].text

  //     let newAllMessages = [
  //         ...allMessages,
  //         {
  //             "role": "user",
  //             "parts": [{
  //                 "text": message
  //             }]
  //         },
  //         {
  //             "role": "model",
  //             "parts": [{
  //                 "text": responseMessage
  //             }]
  //         }
  //     ]

  //     console.log(newAllMessages)

  //     setAllMessages(newAllMessages)
  //     setMessage('')
  // }
  return (
    <div className={styles.rightSection}>
      {/* <Image src={schoolbg} alt="" className={styles.schoolbg} /> */}
      <div className={styles.rightin}>
        <div className={styles.chatgptversion}>
          <p className={styles.text1}>Chat</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>

        {allMessages.length > 0 ? (
          <div className={styles.messages}>
            {allMessages.map((msg, index) => {
              return (
                <div key={index} className={styles.message}>
                  <Image
                    src={msg.role === "user" ? nouserlogo : Logo}
                    width={50}
                    height={50}
                    alt=""
                  />
                  <div className={styles.details}>
                    <h2>{msg.role === "user" ? "You" : "Spotcheck Bot"}</h2>
                    <p>{msg.content}</p>{" "}
                    {/* Access the text property of the content object */}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.nochat}>
            <div className={styles.s1}>
              <h1>How can I help you today?</h1>
            </div>
            <div className={styles.s2}>
              <div className={styles.suggestioncard}>
                <h2>Recommend activities</h2>
                <p>psychology behind decision-making</p>
              </div>
              <div className={styles.suggestioncard}>
                <h2>Recommend activities</h2>
                <p>psychology behind decision-making</p>
              </div>
              <div className={styles.suggestioncard}>
                <h2>Recommend activities</h2>
                <p>psychology behind decision-making</p>
              </div>
              <div className={styles.suggestioncard}>
                <h2>Recommend activities</h2>
                <p>psychology behind decision-making</p>
              </div>
            </div>
          </div>
        )}

        <div className={styles.bottomsection}>
          <div className={styles.messagebar}>
            <input
              type="text"
              placeholder="Message Spotcheck Bot..."
              onChange={(e) => setMessage(e.target.value)}
              value={message}
            />

            {!isSending ? (
              <svg
                onClick={sendMessage}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
                />
              </svg>
            ) : (
              <HashLoader color="#36d7b7" size={30} />
            )}
          </div>
          <p>
            Spotcheck Bot can make mistakes. Consider checking important
            information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RightSection;
