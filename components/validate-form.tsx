import { SyntheticEvent } from "react";
import axios from "axios";
import { Input, Button, Checkbox } from "semantic-ui-react";

import { Form } from "../styles/form.styles";

type Props = {
  notionApiAuthToken: string;
  setNotionApiAuthToken: Function;
  notionDatabaseID: string;
  setNotionDatabaseID: Function;
  setResult: Function;
  clippingsFile: any;
  setClippingsFile: Function;
  setActiveStep: Function;
  resultLoading: boolean;
  includeCoverImage: boolean;
  toggleIncludeCoverImage: Function;
};

const ValidateForm = ({
  notionApiAuthToken,
  setNotionApiAuthToken,
  notionDatabaseID,
  setNotionDatabaseID,
  setResult,
  clippingsFile,
  setClippingsFile,
  setActiveStep,
  resultLoading,
  includeCoverImage,
  toggleIncludeCoverImage,
}: Props) => {
  return (
    <Form
      onSubmit={(e: SyntheticEvent) => {
        e.preventDefault();
        localStorage.setItem("notionApiAuthToken", notionApiAuthToken);
        localStorage.setItem("notionDatabaseId", notionDatabaseID);
        setResult({
          data: [],
          error: false,
          loading: true,
        });

        axios({
          method: "post",
          url: "api/validate-clippings",
          data: {
            notionApiAuthToken,
            notionDatabaseID,
            clippingsFile,
            includeCoverImage,
          },
        })
          .then(({ data }) => {
            setResult({
              data: data.cleanedClippings,
              error: false,
              loading: false,
            });
            setActiveStep(1);
          })
          .catch((e) => {
            console.error(e);
            setResult({
              data: [],
              error: true,
              loading: false,
            });
          });
      }}
    >
      <Input
        fluid
        type="text"
        size="large"
        placeholder="Notion Token"
        value={notionApiAuthToken}
        onChange={(e) => setNotionApiAuthToken(e.target.value)}
      />
      <br />
      <Input
        fluid
        type="text"
        size="large"
        placeholder="Page ID"
        value={notionDatabaseID}
        onChange={(e) => setNotionDatabaseID(e.target.value)}
      />
      <br />
      <Input
        type="file"
        fluid
        onChange={(e) => {
          if (e.target.files) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => {
              setClippingsFile(reader.result);
            };
          }
        }}
      />
      <br />
      <br />
      <Checkbox
        label="Include Cover Image"
        toggle
        checked={includeCoverImage}
        onChange={(e, data) => toggleIncludeCoverImage(data.checked)}
      />
      <br />
      <br />
      <Button
        fluid
        primary
        type="submit"
        disabled={!notionApiAuthToken || !notionDatabaseID || !clippingsFile}
        loading={resultLoading}
      >
        Submit
      </Button>
    </Form>
  );
};

export default ValidateForm;
