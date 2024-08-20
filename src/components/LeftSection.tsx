"use client";
import React, { useEffect, useState } from "react";
import AddIconComponent from "@/assets/AddIcon.svg";
import { Layout, Avatar, Typography, Button, Row, Col } from "antd";
import { Header } from "antd/es/layout/layout";

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
        height: "95%",
        marginTop: "30px",
        borderRadius: "14px !important",
      }}
    >
      {" "}
      <Header
        style={{
          backgroundColor: "#202429",
          borderBottom: "1px solid #212540",
          padding: "20px 10px 20px 10px",
          borderRadius: "14px !important",
        }}
      >
        <Row>
          <Col span={24}>
            <Row>
              <Col span={20}>
                <Typography
                  style={{
                    fontWeight: 600,
                    fontSize: "20px",
                    color: "#FFFFFF",
                  }}
                >
                  Contents
                </Typography>
              </Col>
              <Col span={4} style={{ cursor: "pointer" }}>
                <AddIconComponent />
              </Col>
            </Row>
          </Col>
        </Row>
      </Header>
    </Layout>
  );
};

export default LeftSection;
