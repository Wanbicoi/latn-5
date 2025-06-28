import { Form, Input, Select, message, Button, Space, Flex } from "antd";
import { useForm } from "@refinedev/antd";
import { useInvalidate } from "@refinedev/core";
import { supabaseClient } from "../../utils/supabase-client";
import { MouseEvent } from "react";

interface CreateMemberForm {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

interface CreateMemberFormProps {
  onSuccess?: () => void;
  onCancel?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export function CreateMemberForm({
  onSuccess,
  onCancel,
}: CreateMemberFormProps) {
  const { formProps, onFinish, formLoading } = useForm<CreateMemberForm>();
  const invalidate = useInvalidate();

  const handleSubmit = async (values: CreateMemberForm) => {
    try {
      // Sign up the user using Supabase Auth
      const { data: authData, error: authError } =
        await supabaseClient.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              full_name: values.fullName,
              role: values.role, // Pass role to raw_user_meta_data for the trigger
            },
          },
        });

      if (authError) throw authError;

      if (authData.user) {
        message.success("Member created successfully");
        // Invalidate the members list to refresh the data
        await invalidate({
          resource: "members",
          invalidates: ["list"],
        });
        onSuccess?.();
      }
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Failed to create member"
      );
    }
  };

  return (
    <Form
      {...formProps}
      layout="vertical"
      onFinish={(values) => handleSubmit(values as CreateMemberForm)}
    >
      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: "Please input email" },
          { type: "email", message: "Please enter a valid email" },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[
          { required: true, message: "Please input password" },
          { min: 6, message: "Password must be at least 6 characters" },
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        label="Full Name"
        name="fullName"
        rules={[{ required: true, message: "Please input full name" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item label="Role" name="role" initialValue="labeler">
        <Select>
          <Select.Option value="admin">Admin</Select.Option>
          <Select.Option value="reviewer">Reviewer</Select.Option>
          <Select.Option value="labeler">Labeler</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Flex justify="end" gap={8}>
          <Button type="primary" htmlType="submit" loading={formLoading}>
            Create Member
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Flex>
      </Form.Item>
    </Form>
  );
}
