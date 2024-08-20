"use client";
import React, { useEffect, useState } from "react";
import LogoSiderComponent from "@/assets/LogoSider.svg";
import MenuIconComponent from "@/assets/menuIcon.svg";
import NoteBookIconComponent from "@/assets/noteBookIcon.svg";

import { Layout, Avatar, Typography, Button, Row, Col } from "antd";

const SiderSection = () => {
  return (
    <Layout
      style={{
        backgroundColor: "#202429",
        height: "100%",
      }}
    >
      <Row>
        <Col
          span={24}
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "30px",
            cursor: "pointer",
          }}
        >
          <LogoSiderComponent />
        </Col>
        <Col
          span={24}
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "50px",
            cursor: "pointer",
          }}
        >
          <MenuIconComponent />
        </Col>
        <Col
          span={24}
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "50px",
            cursor: "pointer",
          }}
        >
          <NoteBookIconComponent />
        </Col>
      </Row>
    </Layout>
  );
};

export default SiderSection;
