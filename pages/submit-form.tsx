import axios from "axios";
import { SyntheticEvent, useState, Key } from "react";
import {
  Button,
  Card,
  Image,
  Grid,
  Message,
  Accordion,
  Icon,
} from "semantic-ui-react";

import { CleanedClipping } from "./types";

type Props = {
  clippings: CleanedClipping[];
  notionApiAuthToken: string;
  notionDatabaseID: string;
  books: CleanedClipping[];
  setCompleted: Function;
};

const SubmitForm = ({
  clippings,
  notionApiAuthToken,
  notionDatabaseID,
  books,
  setCompleted,
}: Props) => {
  console.log({ clippings });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const expandAccordion = (e: SyntheticEvent, titleProps: any) => {
    console.log(e, titleProps);
    const { index } = titleProps;
    const newIndex = activeIndex === index ? -1 : index;
    setActiveIndex(newIndex);
  };
  return (
    <div style={{ marginTop: "32px", width: "100%" }}>
      <Grid columns={5} style={{ width: "100%" }}>
        {clippings.map((clipping: CleanedClipping, index: Key) => {
          return (
            <Grid.Column
              style={{
                marginLeft: "0px",
                marginRight: "0px",
                width: "250px",
              }}
              key={index}
            >
              <Card>
                <>
                  {clipping.coverImage && clipping.coverImage && (
                    <Image
                      alt="book cover"
                      src={clipping.coverImage.thumbnail}
                      wrapped
                      ui={false}
                    />
                  )}
                  <Card.Content>
                    <Card.Header>{clipping.title}</Card.Header>
                    <Card.Meta>{clipping.author}</Card.Meta>
                    <Card.Description>
                      <div>
                        <Accordion>
                          <Accordion.Title
                            active={activeIndex === index}
                            index={index}
                            onClick={expandAccordion}
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
                    </Card.Description>
                  </Card.Content>
                </>
              </Card>
            </Grid.Column>
          );
        })}
      </Grid>
      <Grid style={{ marginBottom: "32px" }}>
        <Button
          fluid
          primary={!submitted}
          positive={submitted}
          disabled={!!submitting}
          loading={submitting}
          onClick={() => {
            setSubmitting(true);
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
                setCompleted(true);
                console.log({ data });
                setSubmitted(true);
              })
              .catch((e) => {
                console.error(e);
              })
              .finally(() => {
                setSubmitting(false);
              });
          }}
        >
          {!submitted ? "Upload to Notion" : "Done!"}
        </Button>
        <br />
        <br />
        <br />
      </Grid>
    </div>
  );
};

export default SubmitForm;
