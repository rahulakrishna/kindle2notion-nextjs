import { SyntheticEvent, useState, useEffect, Key } from "react";
import {
  Button,
  Card,
  Image,
  Grid,
  Message,
  Accordion,
  Icon,
  Input,
  Progress,
} from "semantic-ui-react";
import { submitToNotion } from "../utils/submit-to-notion";

import { CleanedClipping } from "../utils/types";

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
  const [currentBook, setCurrentBook] = useState("");
  console.log({ clippings });
  const [clippingsToSubmit, setClippingsToSubmit] =
    useState<CleanedClipping[]>();
  useEffect(() => {
    setClippingsToSubmit(clippings);
  }, [clippings]);
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
      <Grid columns={2} style={{ width: "100%" }}>
        {/* TODO: change the name to booksToSubmit */}
        {clippingsToSubmit?.map((clipping: CleanedClipping, index: Key) => {
          return (
            <Grid.Column
              style={{
                marginLeft: "0px",
                marginRight: "0px",
                width:
                  document.documentElement.clientWidth > 600 ? "50%" : "100%",
              }}
              key={index}
            >
              <Card
                style={{
                  width: "100%",
                  background: clipping.clippings.some((c) => c.length > 2000)
                    ? "rgba(255,0,0, 0.5)"
                    : "#fff",
                }}
              >
                <>
                  <Card.Content>
                    <Card.Header>
                      <div
                        className="flex justify-center items-center"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {clipping.coverImage && clipping.coverImage && (
                          <Image
                            alt="book cover"
                            src={clipping.coverImage.thumbnail}
                            ui={false}
                            className="w-10 mr-2"
                          />
                        )}
                        <textarea
                          value={clipping.title}
                          style={{
                            border: "none",
                            color: "black",
                            fontFamily: "Lato",
                            width: "100%",
                            height: "50px",
                            overflow: "visible",
                            background: clipping.clippings.some(
                              (c) => c.length > 2000
                            )
                              ? "rgba(255,0,0, 0.1)"
                              : "#fff",
                          }}
                          onChange={(e) => {
                            setClippingsToSubmit((prevClippings) => {
                              return prevClippings?.map((c, i) => {
                                if (i === index) {
                                  return {
                                    ...c,
                                    title: e.target.value,
                                  };
                                }
                                return c;
                              });
                            });
                          }}
                        />
                      </div>
                    </Card.Header>
                    <Card.Meta>
                      <input
                        value={clipping.author}
                        className="edit"
                        style={{
                          border: "none",
                          color: "black",
                          fontFamily: "Lato",
                          width: "100%",
                          background: clipping.clippings.some(
                            (c) => c.length > 2000
                          )
                            ? "rgba(255,0,0, 0.1)"
                            : "#fff",
                        }}
                        onChange={(e) => {
                          setClippingsToSubmit((prevClippings) => {
                            return prevClippings?.map((c, i) => {
                              if (i === index) {
                                return {
                                  ...c,
                                  author: e.target.value,
                                };
                              }
                              return c;
                            });
                          });
                        }}
                      />
                    </Card.Meta>
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
                                  <Message>
                                    <textarea
                                      value={c}
                                      onChange={(e) => {
                                        setClippingsToSubmit(
                                          (prevClippings) => {
                                            return prevClippings?.map(
                                              (c, j) => {
                                                if (j === index) {
                                                  return {
                                                    ...c,
                                                    clippings: c.clippings.map(
                                                      (c, k) => {
                                                        console.log({
                                                          c,
                                                          k,
                                                          i,
                                                        });
                                                        if (k === i) {
                                                          return e.target.value;
                                                        }
                                                        return c;
                                                      }
                                                    ),
                                                  };
                                                }
                                                return c;
                                              }
                                            );
                                          }
                                        );
                                      }}
                                      style={{
                                        width: "100%",
                                        color: "black",
                                        border: "none",
                                        background:
                                          c.length > 2000
                                            ? "rgba(255,0,0,0.1)"
                                            : "#f8f8f9",
                                        minHeight: "150px",
                                        overflow: "visible",
                                      }}
                                    ></textarea>
                                  </Message>
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
        {clippingsToSubmit?.some((c) =>
          c.clippings.some((c) => c.length > 2000)
        ) &&
          "Some of your clippings exceed 2000 characters, the limit set by Notion for a block. Please edit the portions highlighted in red"}
        <Button
          fluid
          primary={!submitted}
          positive={submitted}
          disabled={
            !!submitting ||
            clippingsToSubmit?.some((c) =>
              c.clippings.some((c) => c.length > 2000)
            )
          }
          loading={submitting}
          onClick={() => {
            setSubmitting(true);
            console.log({ clippings, clippingsToSubmit, books });
            (async () => {
              await submitToNotion({
                notionApiAuthToken,
                notionDatabaseID,
                books: clippingsToSubmit,
                setCurrentBook,
              });
              setSubmitted(true);
              setSubmitting(false);
            })();
          }}
        >
          {!submitted ? "Upload to Notion" : "Done!"}
        </Button>
      </Grid>
      {currentBook !== "" && submitting && (
        <Progress
          percent={
            clippingsToSubmit !== undefined
              ? (clippingsToSubmit?.map((c) => c.title).indexOf(currentBook) /
                  clippingsToSubmit?.length) *
                100
              : 0
          }
        >
          Adding {currentBook} to Notion
        </Progress>
      )}
    </div>
  );
};

export default SubmitForm;
