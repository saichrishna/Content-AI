import Image from "next/image";
import styles from "./page.module.css";
import LeftSection from "@/components/LeftSection";
import RightSection from "@/components/RightSection";
import SiderSection from "@/components/Sider";
import { Col, Row } from "antd";

export default function Home() {
  return (
    <Row
      gutter={[10, 0]}
      className={styles.mainpage}
      style={{ backgroundColor: "#292D32" }}
    >
      <Col span={1} className={styles.leftOut}>
        <SiderSection />
      </Col>
      <Col span={5} className={styles.leftOut}>
        <LeftSection />
      </Col>
      <Col span={18} className={styles.rightOut}>
        <RightSection />
      </Col>
    </Row>
  );
}
