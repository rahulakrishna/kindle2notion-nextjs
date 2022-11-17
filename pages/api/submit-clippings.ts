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
};

const prepareAggregrateTextForOneBook = (book: Book) => {
  const aggregratedText = book.clippings.reduce(
    (acc: string, clipping: string) => {
      return `${acc} ${clipping}\n\n`;
    },
    ""
  );

  return aggregratedText;
};

type AddBookToNotionArgs = {
  notion: Client;
  notionDatabaseID: string;
  title: string;
  author: string;
  aggregrateText: string;
};

const addBookToNotion = async ({
  notion,
  notionDatabaseID,
  title,
  author,
  aggregrateText,
}: AddBookToNotionArgs) => {
  const response = await notion.pages.create({
    parent: {
      type: "database_id",
      database_id: notionDatabaseID,
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
    },
    children: [
      {
        object: "block",
        paragraph: {
          rich_text: [
            {
              text: {
                content: aggregrateText,
              },
            },
          ],
        },
      },
    ],
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

async function exportToNotion({ books, notionDatabaseID, notion, res }: any) {
  let errorLog = [];
  const keys = Object.keys(books);
  for await (const book of keys) {
    const bookObject: Book = books[book];
    const aggregrateText = prepareAggregrateTextForOneBook(bookObject);
    const { title, author } = bookObject;

    const queryTitle = await getTitle(notionDatabaseID, notion, title);
    const titleExists = queryTitle.results.length > 0;

    if (titleExists) {
      // update flow here
    } else {
      // create flow here
      try {
        const response = await addBookToNotion({
          notion,
          notionDatabaseID,
          title,
          author,
          aggregrateText,
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
