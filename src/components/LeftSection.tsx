"use client";
import React, { useEffect, useState } from "react";
import SpotcheckLogo from "@/assets/SpotcheckLogo.svg";
import nouserlogo from "@/assets/nouserlogo.png";
import Image from "next/image";
import { Layout, Avatar, Typography, Button, Row, Col } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { Header } from "antd/es/layout/layout";
const { Sider } = Layout;
const { Paragraph } = Typography;

const LeftSection = () => {
  const allChats = [
    {
      id: 1,
      chatName: "This is sample Chat 1",
    },
    {
      id: 2,
      chatName: "This is sample Chat 2",
    },
    {
      id: 3,
      chatName: "This is sample Chat 3",
    },
    {
      id: 4,
      chatName: "This is sample Chat 4",
    },
    {
      id: 5,
      chatName: "This is sample Chat 5",
    },
  ];
  return (
    <Layout
      style={{
        backgroundColor: "#202429",
        borderRadius: "14px",
        height: "95%",
        marginTop: "30px",
      }}
    >
      {" "}
      <Header
        style={{
          backgroundColor: "#202429",
          borderBottom: "1px solid #212540",
        }}
      ></Header>
    </Layout>
  );
};

export default LeftSection;
