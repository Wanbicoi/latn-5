import { Create, Edit, useForm, useSelect } from "@refinedev/antd";
import { useParsed } from "@refinedev/core";
import { Form, Input, Select, Tag } from "antd";
import { useNavigate } from "react-router";

export const ProjectsCreate = ({ isEdit }: { isEdit?: boolean }) => {
  const navigate = useNavigate(); // Initialize useNavigate
  const { id } = useParsed();
  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "projects",
    id,
    action: isEdit ? "edit" : "create",
    onMutationSuccess: () => {
      navigate("/projects");
    },
  });

  const handleFinish = async (values: any) => {
    await onFinish({
      ...values,
      tags: values.tags ?? [],
    });
  };

  const ProjectForm = () => (
    <Form
      {...formProps}
      onFinish={handleFinish}
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 18 }}
    >
      <Form.Item label="Name" name={["name"]} rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Description" name={["description"]}>
        <Input />
      </Form.Item>
      <Form.Item
        label="Tags"
        name="tags"
        normalize={(value) => {
          console.log("Tags value:", value);
          return value || [];
        }}
      >
        <TagsSelect />
      </Form.Item>
    </Form>
  );

  return isEdit ? (
    <Edit saveButtonProps={saveButtonProps}>
      <ProjectForm />
    </Edit>
  ) : (
    <Create saveButtonProps={saveButtonProps}>
      <ProjectForm />
    </Create>
  );
};

function TagsSelect(props: any) {
  const { selectProps: selectTagsProps, query } = useSelect({
    resource: "project_tags",
  });
  const options = query.data?.data.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const tagRender = (props: any) => {
    const { label, value, closable, onClose } = props;
    const tag = query.data?.data.find((item: any) => item.id === value);

    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };

    return (
      <Tag
        color={tag?.color}
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{ marginInlineEnd: 4 }}
      >
        {label}
      </Tag>
    );
  };

  return (
    <Select
      {...selectTagsProps}
      options={options}
      {...props}
      mode="multiple"
      style={{ width: "60%" }}
      placeholder="Select tags"
      tagRender={tagRender}
    />
  );
}
