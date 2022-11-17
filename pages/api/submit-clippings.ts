// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Client } from "@notionhq/client";

type Data = {
  name: string;
  page: any;
};

type Book = {
  title: string;
  author: string;
  clippings: Array<string>;
};

type Clipping = {
  title: string;
  author: string;
  location: string;
  body: string;
};

const prepareAggregrateTextForOneBook = (book: Book) => {
  const aggregratedText = book.clippings.reduce(
    (acc: string, clipping: string) => {
      return `${acc} ${clipping}\n\n`;
    },
    ""
  );

  /*
  for each clipping:
    get:
      text // this is the actual clipping value
      page // this is the page number
      location // this is the location in the book
      date // this is the date the clipping was made
    construct:
      aggregratedText // this is the text that will be added to the notion page
        `${text} \n (${page}, ${location}, ${date}) \n\n`
    return 
      [...aggregratedText]
  */
  return aggregratedText;
};

const exportToNotion = () => {};

const addOneBookToNotion = () => {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { notionApiAuthToken, notionDatabaseID, books } = req.body;
  const notion = new Client({
    auth: notionApiAuthToken,
  });

  Object.keys(books).forEach((book: string) => {
    const bookObject: Book = books[book];
    const aggregrateText = prepareAggregrateTextForOneBook(bookObject);
    const { title, author } = bookObject;

    const properties = {
      title,
      author,
    };

    (async () => {
      const queryTitle = await notion.databases.query({
        database_id: notionDatabaseID,
        filter: {
          or: [
            {
              property: "Title",
              rich_text: {
                contains: properties.title,
              },
            },
          ],
        },
      });

      const titleExists = queryTitle.results.length > 0;
      console.log("titleExists", titleExists, queryTitle);
      if (titleExists) {
        // update flow here
      } else {
        // create flow here
        notion.pages.create({
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
      }
    })();

    // now we have the properties, and aggregrate text. we get the title and start adding it to notion
  });

  res.status(200).json({ name: "John Doe", page: "success" });
}
