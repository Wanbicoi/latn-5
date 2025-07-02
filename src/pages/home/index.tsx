import { ArrowRightOutlined, RightOutlined } from "@ant-design/icons";
import { Link } from "@refinedev/core";
import { Button, Result } from "antd";

// Allow TypeScript to recognize the 'lord-icon' custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "lord-icon": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        trigger?: string;
        colors?: string;
        style?: React.CSSProperties | string;
      };
    }
  }
}
import { useEffect } from "react";

type Props = {};

export default function Home({}: Props) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.lordicon.com/lordicon.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Result
        icon={
          <lord-icon
            src="https://cdn.lordicon.com/jeuxydnh.json"
            trigger="hover"
            colors="primary:#8930e8,secondary:#4030e8"
            style={{ width: "160px", height: "160px" }}
          />
        }
        title="Welcome to Medical Imaging Workflow"
        extra={
          <Button
            type="primary"
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            size="large"
          >
            <Link to="/projects">Start create your project</Link>
          </Button>
        }
      />
    </div>
  );
}
