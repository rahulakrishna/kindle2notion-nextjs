import { Client } from "@notionhq/client";
import axios from "axios";

type Book = {
  title: string;
  author: string;
  clippings: Array<string>;
  coverImage: { smallThumbnail: string; thumbnail: string } | undefined;
  lastHighlightedDate: string;
};

type SubmitToNotionArgs = {
  notionApiAuthToken: string;
  notionDatabaseID: string;
  books: Array<any> | undefined;
  setCurrentBook: Function;
};

const prepareAggregrateTextForOneBook = (book: Book) => {
  const aggregratedText = book.clippings.reduce(
    (acc: string[], clipping: string) => {
      return [...acc, clipping];
    },
    []
  );

  return aggregratedText;
};

type AddBookToNotionArgs = {
  notion: Client;
  notionDatabaseID: string;
  title: string;
  author: string;
  aggregrateText: string[];
  coverImage: { smallThumbnail: string; thumbnail: string } | undefined;
  lastHighlightedDate: string;
  notionApiAuthToken: string;
};

type UpdateBookInNotionArgs = {
  notion: Client;
  notionDatabaseID: string;
  title: string;
  author: string;
  aggregrateText: string[];
  coverImage: { smallThumbnail: string; thumbnail: string } | undefined;
  lastHighlightedDate: string;
  pageId: string;
  notionApiAuthToken: string;
};

const updateBookInNotion = async ({
  notion,
  notionDatabaseID,
  title,
  author,
  aggregrateText,
  coverImage,
  lastHighlightedDate,
  pageId,
}: UpdateBookInNotionArgs) => {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      Author: {
        rich_text: [
          {
            text: {
              content: author,
            },
          },
        ],
      },
      "Last Highlighted Date": {
        rich_text: [
          {
            text: {
              content: lastHighlightedDate,
            },
          },
        ],
      },
    },
  });
  const response = await notion.blocks.children.append({
    block_id: pageId,
    children: aggregrateText.map((text: string) => ({
      object: "block",
      quote: {
        rich_text: [
          {
            text: {
              content: text,
            },
          },
        ],
      },
    })),
  });
};

const addBookToNotion = async ({
  notionApiAuthToken,
  notionDatabaseID,
  title,
  author,
  aggregrateText,
  coverImage,
  lastHighlightedDate,
}: AddBookToNotionArgs) => {
  const iconImageURL = coverImage ? coverImage.smallThumbnail : "";

  const coverImageURL = coverImage ? coverImage.thumbnail : "";
  const response = await axios({
    method: "post",
    url: "/add-book-to-notion",
    data: {
      notionApiAuthToken,
      notionDatabaseID,
    },
  });

  return response;
};

const getTitle = async (
  notionDatabaseID: string,
  notionApiAuthToken: string,
  title: string
) => {
  // dont cry. i'll get you a better solution soon
  const queryTitle = await axios({
    method: "post",
    url: "/get-title",
    data: {
      notionApiAuthToken,
      notionDatabaseID,
      title,
    },
  });
  return queryTitle;
};

const getLastHighlightedDate = (book: Book) => {
  const lastClipping = book.clippings[book.clippings.length - 1];
  const lastHighlightedDate = lastClipping.split(" | ")[0];
  return lastHighlightedDate;
};

async function exportToNotion({
  books,
  notionDatabaseID,
  notion,
  setCurrentBook,
  notionApiAuthToken,
}: any) {
  let errorLog = [];
  const keys = Object.keys(books);
  for await (const book of keys) {
    const bookObject: Book = books[book];
    const aggregrateText = prepareAggregrateTextForOneBook(bookObject);
    const lastHighlightedDate = bookObject.lastHighlightedDate;
    const { title, author, coverImage } = bookObject;
    setCurrentBook(title);

    const queryTitle = await getTitle(
      notionDatabaseID,
      notionApiAuthToken,
      title
    );

    console.log({ queryTitle });
    const titleExists = queryTitle.results.length > 0;

    if (titleExists) {
      // update flow here
      // queryTitle should have details on the page
      // modify the contents of that page

      const pageId = queryTitle.results[0].id;
      await updateBookInNotion({
        notion,
        notionDatabaseID,
        title,
        author,
        aggregrateText,
        coverImage,
        lastHighlightedDate,
        pageId,
        notionApiAuthToken,
      });
    } else {
      // create flow here
      try {
        const response = await addBookToNotion({
          notion,
          notionDatabaseID,
          title,
          author,
          aggregrateText,
          coverImage,
          lastHighlightedDate,
          notionApiAuthToken,
        });
      } catch (e) {
        console.error("error while submitting", e);
        errorLog.push(e);
        // this doesn't work for some reason
      }
    }
  }
}

export const submitToNotion = async ({
  notionApiAuthToken,
  notionDatabaseID,
  books,
  setCurrentBook,
}: SubmitToNotionArgs) => {
  const notion = new Client({
    auth: notionApiAuthToken,
  });

  const response = await exportToNotion({
    books,
    notionDatabaseID,
    notion,
    setCurrentBook,
    notionApiAuthToken,
  });
  return response;
};
