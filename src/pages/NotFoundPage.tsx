import { useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container page-body">
      <Result
        status="404"
        title="Page not found"
        subTitle="The page you are looking for does not exist."
        extra={
          <Button type="primary" onClick={() => void navigate('/')}>
            Back to home
          </Button>
        }
      />
    </div>
  );
}
