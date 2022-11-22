// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Client } from "@notionhq/client";

type Data = {
  status: any;
};

type Error = {
  message: string;
};

type Book = {
  title: string;
  author: string;
  clippings: Array<string>;
  coverImage: { smallThumbnail: string; thumbnail: string } | undefined;
  lastHighlightedDate: string;
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
  notion,
  notionDatabaseID,
  title,
  author,
  aggregrateText,
  coverImage,
  lastHighlightedDate,
}: AddBookToNotionArgs) => {
  const iconImageURL = coverImage ? coverImage.smallThumbnail : "";

  const coverImageURL = coverImage ? coverImage.thumbnail : "";

  const response = await notion.pages.create({
    parent: {
      type: "database_id",
      database_id: notionDatabaseID,
    },
    cover: {
      type: "external",
      external: {
        url:
          coverImageURL !== ""
            ? coverImageURL
            : "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      },
    },
    icon:
      iconImageURL !== ""
        ? {
            type: "external",
            external: {
              url: iconImageURL,
            },
          }
        : {
            type: "emoji",
            emoji: "📖",
          },
    properties: {
      Title: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
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
  return response;
};

const getTitle = async (
  notionDatabaseID: string,
  notion: Client,
  title: string
) => {
  const queryTitle = await notion.databases.query({
    database_id: notionDatabaseID,
    filter: {
      or: [
        {
          property: "Title",
          rich_text: {
            contains: title,
          },
        },
      ],
    },
  });
  return queryTitle;
};

const getLastHighlightedDate = (book: Book) => {
  const lastClipping = book.clippings[book.clippings.length - 1];
  const lastHighlightedDate = lastClipping.split(" | ")[0];
  return lastHighlightedDate;
};

async function exportToNotion({ books, notionDatabaseID, notion, res }: any) {
  let errorLog = [];
  const keys = Object.keys(books);
  for await (const book of keys) {
    const bookObject: Book = books[book];
    const aggregrateText = prepareAggregrateTextForOneBook(bookObject);
    const lastHighlightedDate = bookObject.lastHighlightedDate;
    const { title, author, coverImage } = bookObject;

    const queryTitle = await getTitle(notionDatabaseID, notion, title);
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
        });
      } catch (e) {
        console.error("error while submitting", e);
        errorLog.push(e);
        // this doesn't work for some reason
        return res.status(500).json({ status: "error" });
      }
    }
  }

  return res.status(200).json({ status: "success" });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | Error>
) {
  const { notionApiAuthToken, notionDatabaseID, books } = req.body;
  const notion = new Client({
    auth: notionApiAuthToken,
  });

  const response = await exportToNotion({
    books,
    notionDatabaseID,
    notion,
    res,
  });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb",
    },
  },
};
