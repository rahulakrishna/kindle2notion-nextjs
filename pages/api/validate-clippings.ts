// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Clipping = {
  title: string;
  author: string;
  location: string;
  body: string;
};

type CleanedClipping = {
  title: string;
  author: string;
  clippings: Array<string>;
};

type Data = {
  name: string;
  clippings: Array<Clipping>;
  cleanedClippings: Array<CleanedClipping>;
};

const getHighlightedContent = (slug: string) => {
  if (slug) {
    const [, ...rest] = slug.split(":");
    return slug.split(":")[2].slice(2);
  }
  return "";
};

const getTitleAndAuthor = (slug: string) => {
  const title = slug.split("(")[0].trim();
  if (slug.split("(").length <= 1) {
    return { title, author: "" };
  } else {
    const author = slug.split("(")[1].split(")")[0];
    return {
      title,
      author,
    };
  }
};

const convertClippingsArrayToObject = (clippings: Array<Clipping>) => {
  return clippings.reduce((acc: Array<CleanedClipping>, clipping: Clipping) => {
    if (acc.find((a) => a.title === clipping.title)) {
      return acc.map((a) => {
        if (a.title === clipping.title) {
          return {
            ...a,
            clippings: [...a.clippings, clipping.body],
          };
        }
        return a;
      });
    }
    return [
      ...acc,
      {
        title: clipping.title,
        author: clipping.author,
        clippings: [clipping.body],
      },
    ];
  }, []);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { notionApiAuthToken, notionDatabaseID, clippingsFile } = req.body;

  const clippingsArray = clippingsFile
    .split("==========")
    .map((s: string) => {
      const { title, author } = getTitleAndAuthor(s.split("\n")[1]);

      const content = s.split("\n")[4];
      return {
        title,
        author,
        location: s.split("|")[1],
        body: content,
      };
    })
    .filter((c: Clipping) => !!c.body && c.body !== "");

  const cleanedClippings = await convertClippingsArrayToObject(clippingsArray);

  res.status(200).json({
    name: "John Doe",
    clippings: clippingsArray,
    cleanedClippings,
  });
}
