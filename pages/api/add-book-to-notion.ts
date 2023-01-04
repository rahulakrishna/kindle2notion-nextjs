// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Client } from "@notionhq/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const {
    notionApiAuthToken,
    notionDatabaseID,
    title,
    author,
    aggregrateText,
    coverImage,
    lastHighlightedDate,
  } = req.body;
  const notion = new Client({
    auth: notionApiAuthToken,
  });

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
}
