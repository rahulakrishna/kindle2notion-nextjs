import { SyntheticEvent } from "react";
import axios from "axios";
import { Input, Button, Checkbox } from "semantic-ui-react";

import Link from "next/link";

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
    <form
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
      <Link href="https://thisdot.notion.site/Kindle2Notion-Instructions-0e01105be77a471ba0d559f21e494e08">
        Instructions to generate tokens here
      </Link>
      <br />
      <br />
      <Input
        fluid
        type="text"
        size="large"
        placeholder="Notion Token"
        value={notionApiAuthToken}
        onChange={(e) => setNotionApiAuthToken(e.target.value)}
        className="m-b-16"
      />
      <br />
      <Input
        fluid
        type="text"
        size="large"
        placeholder="Page ID"
        value={notionDatabaseID}
        onChange={(e) => setNotionDatabaseID(e.target.value)}
        className="m-b-16"
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
        className="m-b-16"
      />
      <br />
      <br />
      <Checkbox
        disabled
        label="Include Cover Image"
        toggle
        checked={includeCoverImage}
        onChange={(e, data) => toggleIncludeCoverImage(data.checked)}
        className="m-b-16"
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
    </form>
  );
};

export default ValidateForm;
