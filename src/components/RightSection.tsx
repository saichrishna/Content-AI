"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "@/styles/RightSection.module.css";
import nouserlogo from "@/assets/nouserlogo.png";
import { HashLoader } from "react-spinners";
import { Button, Col, Input, message, Row } from "antd";
const { TextArea } = Input;
import { Layout, Typography, List, Avatar, Spin, Image } from "antd";
import { ArrowDownOutlined, SendOutlined } from "@ant-design/icons";
const { Header, Content, Footer } = Layout;
const { Paragraph } = Typography;
import SendLogoComponent from "../assets/sendLogo.svg"; // Adjust the path as necessary
import LogoComponent from "../assets/Logo.svg"; // Adjust the path as necessary
import AgentImageComponent from "../assets/Agent.svg"; // Adjust the path as necessary
import AILogoComponent from "../assets/AgentMessageIcon.svg"; // Adjust the path as necessary

const RightSection = () => {
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [messageC, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [threadId, setThreadId] = useState("");
  const [data, setData] = useState("");
  const [botMsg, setBotMessage] = useState("");
  const [latestMessageIndex, setlatestMessageIndex] = useState(0);
  const [latestMessage, setlatestMessage] = useState("");
  const [gotAnswer, setGotAnswer] = useState(false);
  const [next, setNext] = useState("");
  const [topic, setTopic] = useState("");
  const [prompt, setPrompt] = useState("");
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const [manualLead, setManuallead] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      // Call a function to handle the submission of the message
      setMessage(e.target.value);
    }
  };

  useEffect(() => {
    if (next === "promptEngineer") {
      promptEngineer();
    } else if (next === "contentGenerator") {
      contentGenerator();
    } else if (next === "contentReviewer") {
      contentReviewer();
    } else if (next === "imageGenerator") {
      generateImages();
    }
  }, [next]);

  useEffect(() => {
    errorMessage === "" ? null : errorHandling(errorMessage);
  }, [errorMessage]);

  useEffect(() => {
    manualLead === true ? leadByUser() : null;
  }, [manualLead]);

  useEffect(() => {
    if (
      allMessages[allMessages.length - 1] &&
      allMessages[allMessages.length - 1].role === "user"
    ) {
      setlatestMessageIndex(allMessages.length);
      setlatestMessage("");
    }
  }, [allMessages]);

  useEffect(() => {
    // scrollToBottom();
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
  let concatenatedString = "";

  const errorHandling = (errorMessage: any) => {
    message.error(errorMessage);
  };

  const leadByUser = async () => {
    setAllMessages((prevMessages) => [
      ...prevMessages,
      {
        content:
          "Please enter the topic you have in mind, our Prompt Engineer will help you generate prompt for the same topic.",
        role: "Content Strategist",
      },
    ]);
  };

  const contentStrategist = async () => {
    setAllMessages((prevMessages) => [
      ...prevMessages,
      { content: messageC, role: "user" },
    ]);
    try {
      const requestBody = {
        question: messageC,
      };
      setLoading(true);
      const response = await fetch(
        "http://localhost:3000/api/v1/prediction/907e40af-f770-4238-bbb4-a5feb839d3df",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
      if (!response.ok) {
        errorHandling(response.statusText);
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.chatMessageId.length > 0) {
        result.agentReasoning.map((item: any) => {
          if (item.agentName === "Supervisor") {
          } else {
            // var trends = {};
            const summary = JSON.parse(item.usedTools[0].toolOutput);
            if (summary === "Data not found.!") {
              setAllMessages((prevMessages) => [
                ...prevMessages,
                {
                  content: (
                    <>
                      <Row>
                        <Typography className={styles.messageAppearance}>
                          Unable to retrieve data trends from provider.Do you
                          wish to proceed with the lead?
                        </Typography>
                      </Row>
                      <Row>
                        <Col span={4} style={{ padding: 10 }}>
                          <Button
                            type="primary"
                            onClick={() => selectTopic(messageC)}
                          >
                            Yes
                          </Button>
                        </Col>
                        <Col span={2} style={{ padding: 10 }}>
                          <Button type="primary">No</Button>
                        </Col>
                      </Row>
                    </>
                  ),
                  role: item.agentName,
                },
              ]);
              return;
            } else {
              const trends = summary[messageC];
              const topTrends = trends.top;
              // const topTrends = trends.top;
              const risingTrends = trends.rising;
              // topicList = Object.values(trends);
              setAllMessages((prevMessages) => [
                ...prevMessages,
                {
                  content: (
                    <>
                      <Typography className={styles.messageAppearance}>
                        Here are the current trends, please select one topic to
                        proceed further.
                      </Typography>
                      <div>
                        <Typography className={styles.messageAppearance}>
                          Below are Top Trends:
                          <ul>
                            {topTrends.map((item: any, index: any) => (
                              <li
                                style={{ cursor: "pointer" }}
                                onClick={() => selectTopic(item.query)}
                                key={index}
                              >
                                {item.query}
                              </li>
                            ))}
                          </ul>
                        </Typography>
                      </div>
                      <div>
                        <Typography className={styles.messageAppearance}>
                          Below are Rising Trends:
                          <ul>
                            {risingTrends.map((item: any, index: any) => (
                              <li
                                style={{ cursor: "pointer" }}
                                onClick={() => selectTopic(item.query)}
                                key={index}
                              >
                                {item.query}
                              </li>
                            ))}
                          </ul>
                        </Typography>
                      </div>
                      {/* ) */}
                    </>
                  ),
                  role: item.agentName,
                },
              ]);
              return;
            }
          }
        });
      }
      setMessage("");
    } catch (error) {
      setErrorMessage("An error occurred. Please try again later.");
    } finally {
      setIsSending(false);
      setLoading(false);
    }
  };

  const selectTopic = async (topic: string) => {
    setTopic(topic);
    setNext("promptEngineer");
  };

  const selectPrompt = async (prompt: string) => {
    setPrompt(prompt);
  };

  const selectContent = async (content: string) => {
    setContent(content);
    // setNext("imageGenerator");
    // setNext("contentReviewer");
  };

  const contentGenerator = async () => {
    setAllMessages((prevMessages) => [
      ...prevMessages,
      { content: prompt, role: "user" },
    ]);
    try {
      const requestBody = {
        question: prompt,
      };
      setLoading(true);
      const response = await fetch(
        "http://localhost:3000/api/v1/prediction/fdfb40b7-4de3-4667-9c9f-9c7850a3033f",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
      if (!response.ok) {
        errorHandling(response.statusText);
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.chatMessageId.length > 0) {
        const filterSupervisorMessages = result.agentReasoning.filter(
          (item: any) => item.agentName !== "Supervisor"
        );
        const lastMessage =
          filterSupervisorMessages[filterSupervisorMessages.length - 1]
            .messages[0];
        selectContent(lastMessage);
        result.agentReasoning.map((item: any) => {
          if (item.agentName === "Supervisor") {
            return;
          } else {
            setAllMessages((prevMessages) => [
              ...prevMessages,
              {
                content: lastMessage,
                role: item.agentName,
              },
            ]);
          }
        });
        setAllMessages((prevMessages) => [
          ...prevMessages,
          {
            content: (
              <>
                <Row>
                  <Typography className={styles.messageAppearance}>
                    Do you wish to proceed to generate Images for content?{" "}
                  </Typography>
                </Row>
                <Row>
                  <Col span={12}>
                    <Button
                      type="primary"
                      onClick={() => setNext("imageGenerator")}
                    >
                      Yes
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button>No</Button>
                  </Col>
                </Row>
              </>
            ),
            role: "Content Generator",
          },
        ]);
        setMessage("");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again later.");
    } finally {
      setIsSending(false);
      setLoading(false);
    }
  };

  const contentReviewer = async () => {
    setAllMessages((prevMessages) => [
      ...prevMessages,
      { content: content, role: "user" },
    ]);
    try {
      const requestBody = {
        question: content,
      };
      setLoading(true);
      const response = await fetch(
        "http://localhost:3000/api/v1/prediction/bd3e01d6-d440-4d94-8d8a-ab8bc9b2c28b",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
      if (!response.ok) {
        // errorHandling(response.statusText);
        // throw new Error(`Network response was not ok: ${response.statusText}`);
        setAllMessages((prevMessages) => [
          ...prevMessages,
          {
            content: (
              <>
                <Row>
                  <Typography className={styles.messageAppearance}>
                    There seem's to be issue with Reviewer AI Agent, Do you wish
                    to proceed with above content for Approval?
                  </Typography>
                </Row>
                <Row>
                  <Col span={12}>
                    <Button
                      type="primary"
                      onClick={() => marketingLeadApproval()}
                    >
                      Yes
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button type="primary">No</Button>
                  </Col>
                </Row>
              </>
            ),
            role: "Supervisor",
          },
        ]);
      }
      const result = await response.json();
      if (result.chatMessageId.length > 0) {
        const filterSupervisorMessages = result.agentReasoning.filter(
          (item: any) => item.agentName !== "Supervisor"
        );
        const lastMessage =
          filterSupervisorMessages[filterSupervisorMessages.length - 1]
            .messages[0];
        // selectContent(lastMessage);
        result.agentReasoning.map((item: any) => {
          if (item.agentName === "Supervisor") {
            return;
          } else {
            setAllMessages((prevMessages) => [
              ...prevMessages,
              {
                content: lastMessage,
                role: item.agentName,
              },
            ]);
          }
        });
        setAllMessages((prevMessages) => [
          ...prevMessages,
          {
            content: (
              <>
                <Row>
                  <Typography className={styles.messageAppearance}>
                    Do you wish to proceed to send content for Marketing Manager
                    Lead AI for Approval?
                  </Typography>
                </Row>
                <Row>
                  <Col span={12}>
                    <Button
                      type="primary"
                      onClick={() => marketingLeadApproval()}
                    >
                      Yes
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button type="primary">No</Button>
                  </Col>
                </Row>
              </>
            ),
            role: "Content Reviewer",
          },
        ]);
        setMessage("");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again later.");
    } finally {
      setIsSending(false);
      setLoading(false);
    }
  };

  const postContent = async () => {
    const reqBody = {
      Post_Type: 1920078,
      Post_Content: content,
      Schedule: "2024-01-01T12:00:00Z",
      Image_URL: "",
      Status: 1920104,
    };
    const response = await fetch(
      "https://api.baserow.io/api/database/rows/table/341222/?user_field_names=true",
      {
        method: "POST",
        headers: {
          Authorization: "Token hCqzRhjWfC2063aLLL8ryrmZrm0Q3r6U",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      }
    );
    if (!response.ok) {
      errorHandling(response.statusText);
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const result = await response.json();
    if (result.id) {
      setAllMessages((prevMessages) => [
        ...prevMessages,
        {
          content: (
            <>
              <Row>
                <Typography className={styles.messageAppearance}>
                  Content was posted successfully. ID : {result.id} and
                  scheduled time is {result.Schedule}
                </Typography>
              </Row>
            </>
          ),
          role: "Social Media AI Agent",
        },
      ]);
    } else {
      setAllMessages((prevMessages) => [
        ...prevMessages,
        {
          content: (
            <>
              <Row>
                <Typography className={styles.messageAppearance}>
                  Unable to Post Content Right now. Please try again.
                </Typography>
              </Row>
            </>
          ),
          role: "Social Media AI Agent",
        },
      ]);
    }
  };

  const generateImages = async () => {
    try {
      const data = new FormData();
      data.append("pipeline_name", "Image Generator Pipeline");
      data.append("username", "avinashng");
      data.append("inputs", topic);
      const response = await fetch(
        "https://api.vectorshift.ai/api/pipelines/run%22",
        {
          method: "POST",
          headers: {
            "Api-Key": "sk_I4xIB5vdJQ1xqVchUGQcDscFE23bu8gg9bwHP4r4Z05QAQJS",
          },
          body: data,
        }
      );
      if (!response.ok) {
        setAllMessages((prevMessages) => [
          ...prevMessages,
          {
            content: (
              <>
                <Row>
                  <Typography className={styles.messageAppearance}>
                    There seem's to be issue with Image Generator AI Agent, Do
                    you wish to proceed with above content for Review?
                  </Typography>
                </Row>
                <Row>
                  <Col span={12}>
                    <Button
                      type="primary"
                      onClick={() => setNext("contentReviewer")}
                    >
                      Yes
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button type="primary">No</Button>
                  </Col>
                </Row>
              </>
            ),
            role: "Supervisor",
          },
        ]);
      }
      const result = await response.json();
    } catch {
    } finally {
    }
  };

  const marketingLeadApproval = async () => {
    try {
      const response = await fetch("http://localhost:8000/marketingLead/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: content }),
      });
      if (!response.ok) {
        errorHandling(response.statusText);
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const result = await response.json();

      if (result) {
        setAllMessages((prevMessages) => [
          ...prevMessages,
          {
            content: (
              <>
                <Row>
                  <Typography className={styles.messageAppearance}>
                    Readability Score is {result.readability}
                  </Typography>
                  <Typography className={styles.messageAppearance}>
                    Sentiment analysis Score is {result.sentiment}
                  </Typography>
                </Row>
                <Row>
                  <Typography className={styles.messageAppearance}>
                    Do you wish to proceed?
                  </Typography>
                </Row>
                <Row>
                  <Col span={12}>
                    <Button type="primary" onClick={() => postContent()}>
                      Yes
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button type="primary">No</Button>
                  </Col>
                </Row>
              </>
            ),
            role: "Marketing Manager AI Agent",
          },
        ]);
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again later.");
    } finally {
      setIsSending(false);
      setLoading(false);
    }
  };

  const promptEngineer = async () => {
    setAllMessages((prevMessages) => [
      ...prevMessages,
      { content: topic, role: "user" },
    ]);
    try {
      const requestBody = {
        question: topic,
      };
      setLoading(true);
      const response = await fetch(
        "http://localhost:3000/api/v1/prediction/fc030d30-80a9-49c5-8d57-bbc5abcb86a8",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
      if (!response.ok) {
        errorHandling(response.statusText);
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.chatMessageId.length > 0) {
        const filterSupervisorMessages = result.agentReasoning.filter(
          (item: any) => item.agentName !== "Supervisor"
        );
        const lastMessage =
          filterSupervisorMessages[filterSupervisorMessages.length - 1]
            .messages[0];
        selectPrompt(lastMessage);
        result.agentReasoning.map((item: any) => {
          if (item.agentName === "Supervisor") {
            return;
          } else {
            setAllMessages((prevMessages) => [
              ...prevMessages,
              {
                content: lastMessage,
                role: item.agentName,
              },
            ]);
          }
        });
        setAllMessages((prevMessages) => [
          ...prevMessages,
          {
            content: (
              <>
                <Row>
                  <Typography className={styles.messageAppearance}>
                    Do you wish to proceed with above prompt?
                  </Typography>
                </Row>
                <Row>
                  <Col span={12}>
                    <Button
                      type="primary"
                      onClick={() => setNext("contentGenerator")}
                    >
                      Yes
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button type="primary">No</Button>
                  </Col>
                </Row>
              </>
            ),
            role: "Prompt Generator",
          },
        ]);
        setMessage("");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again later.");
    } finally {
      setIsSending(false);
      setLoading(false);
    }
  };

  // const scrollToBottom = () => {
  //   if (messagesEndRef.current) {
  //     messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // };

  return (
    // <div className={styles.rightSection}>
    //   <div className={styles.rightin}>
    //     <div className={styles.chatgptversion}>
    //       <p className={styles.text1}>Chat</p>
    //       <svg
    //         xmlns="http://www.w3.org/2000/svg"
    //         fill="none"
    //         viewBox="0 0 24 24"
    //         strokeWidth={1.5}
    //         stroke="currentColor"
    //         className="w-6 h-6"
    //       >
    //         <path
    //           strokeLinecap="round"
    //           strokeLinejoin="round"
    //           d="m19.5 8.25-7.5 7.5-7.5-7.5"
    //         />
    //       </svg>
    //     </div>

    //     {allMessages.length > 0 ? (
    //       <div className={styles.messages}>
    //         {allMessages.map((msg, index) => {
    //           return (
    //             <div key={index} className={styles.message}>
    //               <Image
    //                 src={msg.role === "user" ? nouserlogo : Logo}
    //                 width={50}
    //                 height={50}
    //                 alt=""
    //               />
    //               <div className={styles.details}>
    //                 <h2>{msg.role === "user" ? "You" : msg.role}</h2>
    //                 <p>{msg.content}</p>{" "}
    //                 {/* Access the text property of the content object */}
    //               </div>
    //             </div>
    //           );
    //         })}
    //       </div>
    //     ) : (
    //       <div className={styles.nochat}>
    //         <div className={styles.s1}>
    //           <h1>How can I help you today?</h1>
    //         </div>
    //         {/* <div className={styles.s2}>
    //           <div className={styles.suggestioncard}>
    //             <h2>Recommend activities</h2>
    //             <p>Compare Insurance Policies</p>
    //           </div>
    //           <div className={styles.suggestioncard}>
    //             <h2>Recommend activities</h2>
    //             <p>psychology behind decision-making</p>
    //           </div>
    //           <div className={styles.suggestioncard}>
    //             <h2>Recommend activities</h2>
    //             <p>psychology behind decision-making</p>
    //           </div>
    //           <div className={styles.suggestioncard}>
    //             <h2>Recommend activities</h2>
    //             <p>psychology behind decision-making</p>
    //           </div>
    //         </div> */}
    //       </div>
    //     )}

    //     <div className={styles.bottomsection}>
    //       <div className={styles.messagebar}>
    //         <TextArea
    //           placeholder="Message Spotcheck Bot..."
    //           onChange={(e) => setMessage(e.target.value)}
    //           onKeyDown={handleKeyPress} // Call handleKeyPress when a key is pressed
    //           value={messageC}
    //           autoSize
    //           style={{ backgroundColor: "transparent", color: "white" }}
    //         />
    //         {!isSending ? (
    //           <svg
    //             onClick={contentStrategist}
    //             xmlns="http://www.w3.org/2000/svg"
    //             fill="none"
    //             viewBox="0 0 24 24"
    //             strokeWidth={1.5}
    //             stroke="currentColor"
    //             className="w-6 h-6"
    //           >
    //             <path
    //               strokeLinecap="round"
    //               strokeLinejoin="round"
    //               d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
    //             />
    //           </svg>
    //         ) : (
    //           <HashLoader color="#36d7b7" size={30} />
    //         )}
    //       </div>
    //       <p>
    //         Spotcheck Bot can make mistakes. Consider checking important
    //         information.
    //       </p>
    //     </div>
    //   </div>
    // </div>

    <Layout
      style={{
        backgroundColor: "#202429",
        borderRadius: "14px",
        height: "95%",
        marginTop: "30px",
      }}
    >
      <Header
        style={{
          backgroundColor: "#202429",
          borderBottom: "1px solid #212540",
          borderRadius: "14px !important",
        }}
      >
        {/* <Row justify={"center"} align={"middle"}> */}
        <Col
          span={24}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px",
            cursor: "pointer",
          }}
        >
          <AgentImageComponent />
        </Col>
        {/* </Row> */}
      </Header>
      <Content ref={messagesEndRef} style={{ overflow: "auto" }}>
        <Spin spinning={loading} tip="Loading..." style={{ height: "100%" }}>
          <Row
            style={{
              marginTop: 35,
            }}
          >
            <Col span={24}>
              {allMessages.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={allMessages}
                  style={{ padding: 20 }}
                  renderItem={(msg, index) => (
                    <List.Item
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent:
                          msg.role === "user" ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: "50%",
                          padding:
                            msg.role === "user" ? "0 0 0 10px" : "0 10px 0 0", // Padding to avoid overlap with the screen edge
                          textAlign: msg.role === "user" ? "right" : "left",
                        }}
                      >
                        <List.Item.Meta
                          avatar={
                            msg.role === "user" ? null : <AILogoComponent />
                          }
                          title={
                            <strong>
                              {msg.role === "user" ? null : (
                                <Typography
                                  style={{
                                    color: "#9194A0",
                                    fontSize: "18px",
                                    fontWeight: 400,
                                    lineHeight: "27px",
                                  }}
                                >
                                  {msg.role}
                                </Typography>
                              )}
                            </strong>
                          }
                          description={
                            <Typography
                              style={{
                                color: "#FFFFFF",
                                fontWeight: 400,
                                fontSize: "18px",
                                lineHeight: "27px",
                                borderRadius: "15px", // Rounded corners for user messages
                                whiteSpace: "normal", // Ensures the text wraps normally
                                wordBreak: "break-word", // Prevents long words from overflowing
                                display: "inline-block", // Ensures block-level display for normal text flow
                                backgroundColor:
                                  msg.role === "user"
                                    ? "#444C9B"
                                    : "transparent", // Blue background for user messages
                                padding:
                                  msg.role === "user"
                                    ? "10px 20px 10px 20px"
                                    : "0px", // Padding inside the message bubble
                              }}
                            >
                              {msg.content}
                            </Typography>
                          }
                        />
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Row style={{ textAlign: "center", marginTop: 50 }}>
                  <Col span={24}>
                    <LogoComponent height={100} />
                  </Col>
                  {/* Adjust width and height as needed */}
                  <Col span={24}>
                    <Typography.Title
                      style={{
                        color: "#FFFFFF",
                        textAlign: "center",
                        fontSize: "36px",
                      }}
                    >
                      Welcome to Content AI
                    </Typography.Title>
                  </Col>
                  <Col span={24}>
                    <Row>
                      <Col span={7}></Col>
                      <Col
                        span={10}
                        style={{
                          alignContent: "center",
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          style={{
                            color: "#FFFFFF",
                            fontSize: "14px",
                            lineHeight: "21px",
                          }}
                        >
                          Unlock your creative potential with our powerful
                          content creation tool—designed to streamline your
                          workflow, enhance your storytelling, and bring your
                          ideas to life across any platform.
                        </Typography>
                      </Col>
                      <Col span={7}></Col>
                    </Row>
                  </Col>
                  <Col span={24} style={{ marginTop: 20, cursor: "pointer" }}>
                    <Typography.Title
                      style={{
                        color: "#3F5DFF",
                        textAlign: "center",
                        fontSize: "24px",
                        fontWeight: 400,
                        lineHeight: "36px",
                      }}
                    >
                      # Get the topic
                    </Typography.Title>
                  </Col>
                  <Col span={24} style={{ marginTop: 10, cursor: "pointer" }}>
                    <Typography.Title
                      style={{
                        color: "#3F5DFF",
                        textAlign: "center",
                        fontSize: "24px",
                        fontWeight: 400,
                        lineHeight: "36px",
                      }}
                    >
                      # Content Creation
                    </Typography.Title>
                  </Col>
                  <Col span={24} style={{ marginTop: 10, cursor: "pointer" }}>
                    <Typography.Title
                      style={{
                        color: "#3F5DFF",
                        textAlign: "center",
                        fontSize: "24px",
                        fontWeight: 400,
                        lineHeight: "36px",
                      }}
                    >
                      # Image Generation
                    </Typography.Title>
                  </Col>
                </Row>
              )}
            </Col>
          </Row>
        </Spin>
      </Content>
      <Footer style={{ backgroundColor: "#202429", borderRadius: "14px" }}>
        <>
          <Col
            span={24}
            style={{
              padding: "10px 0",
              display: "flex",
              alignItems: "center",
            }}
          >
            <TextArea
              placeholder="Create Content"
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              value={messageC}
              autoSize
              style={{
                backgroundColor: "transparent",
                color: "white",
                flex: 1,
                borderRadius: "87px",
                border: "2px solid #9194A0",
              }}
            />
            {!isSending ? (
              <Button
                size={"large"}
                type="primary"
                shape="circle"
                icon={<SendLogoComponent />} // Use your imported SVG here
                onClick={contentStrategist}
                style={{ marginLeft: 10 }}
              />
            ) : (
              <Spin style={{ marginLeft: 10 }} />
            )}
          </Col>
        </>
      </Footer>
    </Layout>
  );
};

export default RightSection;
