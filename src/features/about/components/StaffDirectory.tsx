import { Col, Empty, Row, Typography } from "antd";
import { portraitItems } from "../../../data/media";
import { staffMembers } from "../../../data/staff";
import type { StaffGroup } from "../../../types/staff";
import { StaffCard } from "./StaffCard";

const GROUPS: readonly { key: StaffGroup; label: string }[] = [
  { key: "leadership", label: "Leadership" },
  { key: "faculty", label: "Faculty researchers" },
  { key: "staff", label: "Office staff" },
];

const portraitById = new Map(portraitItems.map((item) => [item.id, item]));

export function StaffDirectory() {
  if (staffMembers.length === 0) {
    return <Empty description="Staff directory coming soon" />;
  }

  return (
    <>
      {GROUPS.map(({ key, label }) => {
        const members = staffMembers.filter((member) => member.group === key);
        if (members.length === 0) return null;

        return (
          <section key={key} aria-label={label} style={{ marginBottom: 32 }}>
            <Typography.Title level={3} style={{ marginBottom: 16 }}>
              {label}
            </Typography.Title>
            <Row gutter={[16, 16]}>
              {members.map((member) => (
                <Col key={member.id} xs={24} sm={12} lg={8} xl={6}>
                  <StaffCard
                    member={member}
                    portrait={
                      member.photoId
                        ? portraitById.get(member.photoId)
                        : undefined
                    }
                  />
                </Col>
              ))}
            </Row>
          </section>
        );
      })}
    </>
  );
}
