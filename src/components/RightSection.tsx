"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "@/styles/RightSection.module.css";
import { Button, Col, Input, message, Row, Select } from "antd";
const { TextArea } = Input;
import { Layout, Typography, List, Avatar, Spin, Image } from "antd";
const { Header, Content, Footer } = Layout;
import SendLogoComponent from "../assets/sendLogo.svg"; // Adjust the path as necessary
import LogoComponent from "../assets/Logo.svg"; // Adjust the path as necessary
import AgentImageComponent from "../assets/Agent.svg"; // Adjust the path as necessary
import AILogoComponent from "../assets/AgentMessageIcon.svg"; // Adjust the path as necessary
import { DatePicker, Space } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { endpoints } from "../utils/apiRouter";
import { companyDetails } from "../utils/companyDescription";

dayjs.extend(customParseFormat);
const { Option } = Select;

const RightSection = () => {
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [messageC, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [latestMessageIndex, setlatestMessageIndex] = useState(0);
  const [latestMessage, setlatestMessage] = useState("");
  const [next, setNext] = useState("");
  const [topic, setTopic] = useState("");
  const [prompt, setPrompt] = useState("");
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const [image, setImage] = useState("");
  const [userPrompt, setUserPrompt] = useState(false);
  const [regenerate, setRegenerate] = useState(false); // Used to force re-run of the same function

  useEffect(() => {
    if (next && regenerate) {
      // Ensure `next` is not an empty string
      if (next === "promptEngineer") {
        promptEngineer();
      } else if (next === "contentGenerator") {
        contentGenerator();
      } else if (next === "contentReviewer") {
        contentReviewer();
      } else if (next === "imageGenerator") {
        generateImages();
      }
      setRegenerate(false);
    }
  }, [next, regenerate]);

  const triggerNext = (newNext: any) => {
    if (next === newNext) {
      // If the same function is called again, trigger `regenerate`
      setRegenerate(true);
    } else {
      // If a different function is selected, update `next` and set `regenerate` to true
      setNext(newNext);
      setRegenerate(true);
    }
  };

  useEffect(() => {
    errorMessage === "" ? null : errorHandling(errorMessage);
  }, [errorMessage]);

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

  const handlePlatformChange = (value: string) => {
    // setSelectedPlatform(value);
    localStorage.setItem("selectedPlatform", value);
  };

  const onOk = (value: any) => {
    var formattedDate = "2020-01-01T12:00:00Z";
    if (value) {
      formattedDate = value.format("YYYY-MM-DDTHH:mm:ss[Z]");
    }
    // setSelectedDate(formattedDate);
    // setDate(formattedDate);
    localStorage.setItem("selectedDate", formattedDate);
  };

  const errorHandling = (errorMessage: any) => {
    message.error(errorMessage);
  };

  const promptByUser = async () => {
    setAllMessages((prevMessages) => [
      ...prevMessages,
      {
        content:
          "Please enter the Prompt, once you send it, will proceed to generate content",
        role: "Supervisor",
      },
    ]);
    setUserPrompt(true);
  };

  const defineTopic = async () => {
    // selectTopic(messageC)
    setAllMessages((prevMessages) => [
      ...prevMessages,
      {
        content: (
          <>
            <Row>
              <Typography className={styles.messageAppearance}>
                Do you wish to get related topics?
              </Typography>
            </Row>
            <Row>
              <Col span={24}>
                <Row>
                  <Col span={4} style={{ padding: 10 }}>
                    <Button type="primary" onClick={() => contentStrategist()}>
                      <Typography className={styles.messageAppearance}>
                        Yes
                      </Typography>
                    </Button>
                  </Col>
                  <Col span={4} style={{ padding: 10 }}>
                    <Button
                      type="primary"
                      onClick={() => selectTopic(messageC)}
                    >
                      <Typography className={styles.messageAppearance}>
                        No
                      </Typography>
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </>
        ),
        role: "Content Strategist",
      },
    ]);
  };

  const definePrompt = async () => {
    setAllMessages((prevMessages) => [
      ...prevMessages,
      { content: messageC, role: "user" },
    ]);
    setPrompt(messageC);
    triggerNext("contentGenerator");
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
      const response = await fetch(endpoints.contentStrategist, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        errorHandling(response.statusText);
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.chatMessageId.length > 0) {
        const filterSupervisorMessages = result.agentReasoning.filter(
          (item: any) => item.agentName !== "Supervisor"
        );
        const summary = JSON.parse(filterSupervisorMessages[0].messages[0]);
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
                    <ul>
                      {/* {topTrends.map((item: any, index: any) => ( */}
                      {summary.map((item: any, index: any) => (
                        <li
                          style={{
                            color: "#3F5DFF",
                            cursor: "pointer",
                          }} // onClick={() => selectTopic(item.query)}
                          onClick={() => selectTopic(item)}
                          key={index}
                        >
                          {/* {item.query} */}
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Typography>
                </div>
                {/* <div>
        //                 <Typography className={styles.messageAppearance}>
        //                   Below are Rising Trends:
        //                   <ul>
        //                     {risingTrends.map((item: any, index: any) => (
        //                       <li
        //                         style={{ cursor: "pointer" }}
        //                         onClick={() => selectTopic(item.query)}
        //                         key={index}
        //                       >
        //                         {item.query}
        //                       </li>
        //                     ))}
        //                   </ul>
        //                 </Typography>
                      </div> */}
                {/* ) */}
              </>
            ),
            role: "Content Strategist",
          },
        ]);
        setMessage("");

        return;
      }
    } catch (error) {
      setAllMessages((prevMessages) => [
        ...prevMessages,
        {
          content: (
            <>
              <Row>
                <Typography className={styles.messageAppearance}>
                  Unable to retrieve data trends from provider.Do you wish to
                  proceed with the lead?
                </Typography>
              </Row>
              <Row>
                <Col span={24}>
                  <Row>
                    <Col span={4} style={{ padding: 10 }}>
                      <Button
                        type="primary"
                        onClick={() => selectTopic(messageC)}
                      >
                        <Typography className={styles.messageAppearance}>
                          Yes
                        </Typography>
                      </Button>
                    </Col>
                    <Col span={4} style={{ padding: 10 }}>
                      <Button type="primary">
                        <Typography className={styles.messageAppearance}>
                          No
                        </Typography>
                      </Button>
                    </Col>
                  </Row>
                </Col>
                <Col span={4} style={{ padding: 10 }}>
                  <Button type="primary" onClick={() => selectTopic(messageC)}>
                    <Typography className={styles.messageAppearance}>
                      Yes
                    </Typography>
                  </Button>
                </Col>
                <Col span={4} style={{ padding: 10 }}>
                  <Button type="primary">No</Button>
                </Col>
              </Row>
            </>
          ),
          role: "Content Strategist",
        },
      ]);
      // setErrorMessage("An error occurred. Please try again later.");
    } finally {
      setIsSending(false);
      setLoading(false);
    }
  };

  const selectTopic = async (topic: string) => {
    setTopic(topic);
    triggerNext("promptEngineer");
  };

  const selectPrompt = async (prompt: string) => {
    if (prompt.includes("Prompt:")) {
      // Split the string at "**Prompt**:" and take the part after it
      const trimmedPrompt = prompt.split("Prompt:")[1].trim();
      setPrompt(trimmedPrompt);
      return;
    } else if (prompt.includes("Improved Prompt:")) {
      // Split the string at "**Prompt**:" and take the part after it
      const trimmedPrompt = prompt.split("Improved Prompt:")[1].trim();
      setPrompt(trimmedPrompt);
      return;
    } else if (prompt.includes("improved prompt:")) {
      // Split the string at "**Prompt**:" and take the part after it
      const trimmedPrompt = prompt.split("improved prompt:")[1].trim();
      setPrompt(trimmedPrompt);
      return;
    } else if (prompt.includes("prompt:")) {
      // Split the string at "**Prompt**:" and take the part after it
      const trimmedPrompt = prompt.split("prompt:")[1].trim();
      setPrompt(trimmedPrompt);
      return;
    } else if (prompt.includes("**Improved Prompt**:")) {
      // Split the string at "**Prompt**:" and take the part after it
      const trimmedPrompt = prompt.split("**Improved Prompt**:")[1].trim();
      setPrompt(trimmedPrompt);
      return;
    } else if (prompt.includes("**Prompt**:")) {
      // Split the string at "**Prompt**:" and take the part after it
      const trimmedPrompt = prompt.split("**Prompt**:")[1].trim();
      setPrompt(trimmedPrompt);
      return;
    } else if (prompt.includes("**Output Format**:")) {
      // Split the string at "**Prompt**:" and take the part after it
      const trimmedPrompt = prompt.split("**Output Format**:")[1].trim();
      setPrompt(trimmedPrompt);
      return;
    } else if (prompt.includes("Output Format:")) {
      // Split the string at "**Prompt**:" and take the part after it
      const trimmedPrompt = prompt.split("Output Format:")[1].trim();
      setPrompt(trimmedPrompt);
      return;
    } else {
      setPrompt(prompt);
    }
  };

  const selectContent = async (content: string) => {
    if (content.includes("**Revised Content:**")) {
      // Split the string at "**Prompt**:" and take the part after it
      const trimmedContent = prompt.split("**Revised Content:**")[1].trim();
      setContent(trimmedContent);
      return;
    } else if (content.includes("Revised Content:")) {
      // Split the string at "**Prompt**:" and take the part after it
      const trimmedContent = prompt.split("Revised Content:")[1].trim();
      setContent(trimmedContent);
      return;
    } else if (content.includes("Content:")) {
      // Split the string at "**Prompt**:" and take the part after it
      const trimmedContent = prompt.split("Content:")[1].trim();
      setContent(trimmedContent);
      return;
    } else if (content.includes("**Content:**")) {
      // Split the string at "**Prompt**:" and take the part after it
      const trimmedContent = prompt.split("**Content:**")[1].trim();
      setContent(trimmedContent);
      return;
    } else {
      setContent(content);
    }
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
      const response = await fetch(endpoints.contentGenerator, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        errorHandling(response.statusText);
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.chatMessageId.length > 0) {
        const filterSupervisorMessages = result.agentReasoning.filter(
          (item: any) => item.agentName === "Content Generator"
        );
        const lastMessage = filterSupervisorMessages[0].messages[0];
        selectContent(lastMessage);
        result.agentReasoning.map((item: any) => {
          if (item.agentName === "Supervisor") {
            return;
          } else {
            setAllMessages((prevMessages) => [
              ...prevMessages,
              {
                content: item.messages[0],
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
                    Do you wish to proceed to generate Images for content?
                  </Typography>
                </Row>
                <Row>
                  <Col span={24}>
                    <Row>
                      <Col span={4} style={{ padding: 10 }}>
                        <Button
                          type="primary"
                          onClick={() => triggerNext("imageGenerator")}
                        >
                          <Typography className={styles.messageAppearance}>
                            Yes
                          </Typography>
                        </Button>
                      </Col>
                      <Col span={4} style={{ padding: 10 }}>
                        <Button type="primary">
                          <Typography className={styles.messageAppearance}>
                            No
                          </Typography>
                        </Button>
                      </Col>
                    </Row>
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
      setUserPrompt(false);
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
      const response = await fetch(endpoints.contentReviewer, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        errorHandling(response.statusText);
        throw new Error(`Network response was not ok: ${response.statusText}`);
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
                  <Col span={24}>
                    <Row>
                      <Col span={4} style={{ padding: 10 }}>
                        <Button
                          type="primary"
                          onClick={() => marketingLeadApproval()}
                        >
                          <Typography className={styles.messageAppearance}>
                            Yes
                          </Typography>
                        </Button>
                      </Col>
                      <Col span={4} style={{ padding: 10 }}>
                        <Button type="primary">
                          <Typography className={styles.messageAppearance}>
                            No
                          </Typography>
                        </Button>
                      </Col>
                    </Row>
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
        selectContent(result.text);
        result.agentReasoning.map((item: any) => {
          if (item.agentName === "Supervisor") {
            return;
          } else {
            setAllMessages((prevMessages) => [
              ...prevMessages,
              {
                content: item.messages[0],
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
                  <Col span={24}>
                    <Row>
                      <Col span={4} style={{ padding: 10 }}>
                        <Button
                          type="primary"
                          onClick={() => marketingLeadApproval()}
                        >
                          <Typography className={styles.messageAppearance}>
                            Yes
                          </Typography>
                        </Button>
                      </Col>
                      <Col span={4} style={{ padding: 10 }}>
                        <Button type="primary">
                          <Typography className={styles.messageAppearance}>
                            No
                          </Typography>
                        </Button>
                      </Col>
                    </Row>
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
    const platform = localStorage.getItem("selectedPlatform");
    const scheduleDate = localStorage.getItem("selectedDate");

    const social_media = platform ? platform.split(",").map(Number) : [];
    for (const item of social_media) {
      const reqBody = {
        Post_Type: 1920079,
        Post_Content: content,
        Schedule: scheduleDate,
        Image_URL: image,
        Status: 1920104,
        Social_Media: item,
      };
      const response = await fetch(endpoints.socialMediaAgent, {
        method: "POST",
        headers: {
          Authorization: "Token hCqzRhjWfC2063aLLL8ryrmZrm0Q3r6U",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      });
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
                    scheduled for {localStorage.getItem("selectedDate")}
                    {/* scheduled for {result.Schedule} */}
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
    }
  };

  const selectImage = async (imageURL: string) => {
    setImage(imageURL);
    triggerNext("contentReviewer");
  };

  const generateImages = async () => {
    try {
      const requestBody = {
        question: topic,
      };
      setLoading(true);
      const response = await fetch(endpoints.imageGenerator, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
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
                  <Col span={24}>
                    <Row>
                      <Col span={4} style={{ padding: 10 }}>
                        <Button
                          type="primary"
                          onClick={() => triggerNext("contentReviewer")}
                        >
                          <Typography className={styles.messageAppearance}>
                            Yes
                          </Typography>
                        </Button>
                      </Col>
                      <Col span={4} style={{ padding: 10 }}>
                        <Button type="primary">
                          <Typography className={styles.messageAppearance}>
                            No
                          </Typography>
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </>
            ),
            role: "Supervisor",
          },
        ]);
      }
      const result = await response.json();
      const text = result.text;
      const urlMatch = text.match(/\((.*?)\)/);
      const imageURL = urlMatch ? urlMatch[1] : null;

      setAllMessages((prevMessages) => [
        ...prevMessages,
        {
          content: (
            <>
              <Row>
                <Image
                  width={200}
                  src={imageURL}
                  alt="Generated Character"
                  preview={false} // Disable preview if you don't want a lightbox effect
                  style={{
                    borderRadius: "10px",
                  }}
                />
              </Row>
              <Row>
                <Typography className={styles.messageAppearance}>
                  Do you wish to proceed with Image generated?
                </Typography>
              </Row>
              <Row>
                <Col span={24}>
                  <Row>
                    <Col span={4} style={{ padding: 10 }}>
                      <Button
                        type="primary"
                        onClick={() => selectImage(imageURL)}
                      >
                        <Typography className={styles.messageAppearance}>
                          Yes
                        </Typography>
                      </Button>
                    </Col>
                    <Col span={4} style={{ padding: 10 }}>
                      <Button type="primary" onClick={generateImages}>
                        <Typography className={styles.messageAppearance}>
                          No
                        </Typography>
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </>
          ),
          role: "Image Generator",
        },
      ]);
    } catch (error) {
      setErrorMessage("An error occurred. Please try again later.");
    } finally {
      setIsSending(false);
      setLoading(false);
    }
  };

  const marketingLeadApproval = async () => {
    try {
      const response = await fetch(endpoints.marketingLead, {
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
                  <Typography
                    style={{
                      color: "#3F5DFF",
                      cursor: "pointer",
                    }}
                    className={styles.messageAppearance}
                  >
                    Readability Score : {result.readability}
                  </Typography>
                </Row>
                <Row style={{ marginBottom: "14px" }}>
                  <Typography
                    style={{
                      color: "#3F5DFF",
                      cursor: "pointer",
                    }}
                    className={styles.messageAppearance}
                  >
                    Sentiment analysis Score : {result.sentiment}
                  </Typography>
                </Row>
                <Row>
                  <Typography className={styles.messageAppearance}>
                    Schedule time and platform for the post
                  </Typography>
                </Row>

                <Row>
                  <Col span={24} style={{ marginTop: 20 }}>
                    <DatePicker
                      className="custom-blue-bg"
                      format="YYYY-MM-DD HH:mm:ss"
                      // showTime={{
                      //   defaultValue: dayjs("00:00:00", "HH:mm:ss"),
                      // }}
                      showTime
                      // onChange={handleDateChange}
                      onOk={onOk}
                      style={{ width: 300 }}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={24} style={{ marginTop: 20 }}>
                    <Select
                      style={{ width: 300 }}
                      // value={selectedPlatform} // Set the value here
                      onChange={handlePlatformChange}
                      defaultActiveFirstOption
                      mode="multiple"
                      options={[
                        { value: "1952281", label: "Facebook" },
                        { value: "1952282", label: "LinkedIn" },
                      ]}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Row>
                      <Col span={4} style={{ marginTop: 20 }}>
                        <Button type="primary" onClick={postContent}>
                          <Typography className={styles.messageAppearance}>
                            Continue
                          </Typography>
                        </Button>
                      </Col>
                    </Row>
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

  const iteratePrompt = async () => {
    setAllMessages((prevMessages) => [
      ...prevMessages,
      {
        content: (
          <>
            <Row>
              <Col span={24}>
                <Row>
                  <Col span={10} style={{ padding: 10 }}>
                    <Button type="primary" onClick={() => promptByUser()}>
                      <Typography className={styles.messageAppearance}>
                        Have your own Prompt?
                      </Typography>
                    </Button>
                  </Col>
                  <Col span={10} style={{ padding: 10 }}>
                    <Button
                      type="primary"
                      onClick={() => triggerNext("promptEngineer")}
                    >
                      <Typography className={styles.messageAppearance}>
                        Regenerate Prompt
                      </Typography>
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </>
        ),
        role: "Prompt Generator",
      },
    ]);
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
      const response = await fetch(endpoints.promptEngineer, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
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
                content: item.messages[0],
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
                  <Col span={24}>
                    <Row>
                      <Col span={4} style={{ padding: 10 }}>
                        <Button
                          type="primary"
                          onClick={() => triggerNext("contentGenerator")}
                        >
                          <Typography className={styles.messageAppearance}>
                            Yes
                          </Typography>
                        </Button>
                      </Col>
                      <Col span={4} style={{ padding: 10 }}>
                        <Button type="primary" onClick={() => iteratePrompt()}>
                          <Typography className={styles.messageAppearance}>
                            No
                          </Typography>
                        </Button>
                      </Col>
                    </Row>
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

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
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
      </Header>
      <Content ref={messagesEndRef} style={{ overflow: "auto" }}>
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
                              display:
                                msg.role === "user"
                                  ? "inline-block"
                                  : undefined, // Ensures block-level display for normal text flow
                              backgroundColor:
                                msg.role === "user" ? "#444C9B" : "transparent", // Blue background for user messages
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
                <Col span={24}>
                  <Typography className={styles.companyTitle}>
                    {companyDetails.title}
                  </Typography>
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
                      <Typography className={styles.companyDescription}>
                        {companyDetails.description}
                      </Typography>
                    </Col>
                    <Col span={7}></Col>
                  </Row>
                </Col>
                <Col span={24} style={{ marginTop: 20, cursor: "pointer" }}>
                  <Typography className={styles.companySubDescription}>
                    {companyDetails.subDescription}
                  </Typography>
                </Col>
              </Row>
            )}
            {/* Display "typing..." when loading is true */}
            {loading && (
              <Row
                style={{
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <Col span={24}>
                  <Typography.Text className={styles.typingAnimation}>
                    typing
                  </Typography.Text>
                </Col>
              </Row>
            )}
          </Col>
        </Row>
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
              placeholder="Discover new Marketing Horizons"
              onChange={(e) => setMessage(e.target.value)}
              value={messageC}
              autoSize
              className={styles.userPrompt}
            />
            {!isSending ? (
              <Button
                size={"large"}
                type="primary"
                shape="circle"
                icon={<SendLogoComponent />} // Use your imported SVG here
                onClick={userPrompt ? definePrompt : defineTopic}
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
