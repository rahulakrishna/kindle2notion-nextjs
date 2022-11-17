import axios from "axios";
import { Key } from "react";
import {
  Button,
  Card,
  Grid,
  Message,
  Accordion,
  Icon,
} from "semantic-ui-react";

import { CleanedClipping } from "./types";

type Props = {
  clippings: CleanedClipping[];
  activeIndex: Key | null;
  expandAccordion: Function;
  notionApiAuthToken: string;
  notionDatabaseID: string;
  books: CleanedClipping[];
};

const SubmitForm = ({
  clippings,
  activeIndex,
  expandAccordion,
  notionApiAuthToken,
  notionDatabaseID,
  books,
}: Props) => {
  return (
    <div style={{ marginTop: "32px", width: "100%" }}>
      <Grid columns={1} style={{ width: "100%" }}>
        {clippings.map((clipping: CleanedClipping, index: Key) => {
          return (
            <Grid.Column
              style={{ marginLeft: "0px", marginRight: "0px" }}
              key={index}
            >
              <Card
                fluid
                header={clipping.title}
                meta={clipping.author}
                description={() => (
                  <div>
                    <Accordion>
                      <Accordion.Title
                        active={activeIndex === index}
                        index={index}
                        onClick={() => expandAccordion()}
                      >
                        <Icon name="dropdown" />
                        {clipping.clippings.length} clippings
                      </Accordion.Title>
                      <Accordion.Content active={activeIndex === index}>
                        <ol>
                          {clipping.clippings.map((c, i) => (
                            <li key={i}>
                              <Message>{c}</Message>
                            </li>
                          ))}
                        </ol>
                      </Accordion.Content>
                    </Accordion>
                  </div>
                )}
              />
            </Grid.Column>
          );
        })}
      </Grid>
      <Grid style={{ marginBottom: "32px" }}>
        <Button
          fluid
          primary
          onClick={() => {
            axios({
              method: "post",
              url: "api/submit-clippings",
              data: {
                notionApiAuthToken,
                notionDatabaseID,
                books,
              },
            })
              .then(({ data }) => {
                console.log({ data });
              })
              .catch((e) => {
                console.error(e);
              });
          }}
        >
          Upload to Notion
        </Button>
        <br />
        <br />
        <br />
      </Grid>
    </div>
  );
};

export default SubmitForm;
