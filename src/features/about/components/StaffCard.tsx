import { MailOutlined } from "@ant-design/icons";
import { Avatar, Card, Space, Tag, Typography } from "antd";
import type { ImageItem } from "../../../types/media";
import type { StaffMember } from "../../../types/staff";
import { safeHref as safeUrl } from '../../../lib/safeUrl';

interface StaffCardProps {
  member: StaffMember;
  portrait?: ImageItem;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function StaffCard({ member, portrait }: StaffCardProps) {
  const photo = portrait ? safeUrl(portrait.src) : null;

  return (
    <Card style={{ height: "100%", textAlign: "center" }}>
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Avatar
          size={96}
          src={photo ?? undefined}
          alt={portrait?.alt ?? member.name}
          style={{ backgroundColor: "var(--color-primary)", fontSize: 32 }}
        >
          {getInitials(member.name)}
        </Avatar>

        <div>
          <Typography.Title level={5} style={{ margin: 0 }}>
            {member.name}
          </Typography.Title>
          <Typography.Text type="secondary">{member.title}</Typography.Text>
          {member.department && (
            <div>
              <Typography.Text type="secondary">
                {member.department}
              </Typography.Text>
            </div>
          )}
        </div>

        {member.researchInterests && member.researchInterests.length > 0 && (
          <div>
            {member.researchInterests.map((interest) => (
              <Tag key={interest} style={{ marginBottom: 4 }}>
                {interest}
              </Tag>
            ))}
          </div>
        )}

        {member.email && (
          <Typography.Link href={`mailto:${member.email}`}>
            <MailOutlined /> {member.email}
          </Typography.Link>
        )}
      </Space>
    </Card>
  );
}
