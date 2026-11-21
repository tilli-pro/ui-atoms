/** biome-ignore-all lint/suspicious/noExplicitAny: ! */
/** biome-ignore-all lint/complexity/noBannedTypes: ? */
const fetchJson = <T>(url: string, options?: RequestInit) =>
  fetch(url, options)
    .then((res) => res.json() as Promise<T>)
    .catch((e) => {
      console.log(e);
      // no-op
    });

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
export const randomInteger = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const promiseChain = async (
  step: (value: unknown) => void,
  ...promises: ((...args: any[]) => Promise<unknown>)[]
) =>
  promises.reduce(
    (acc, curr) =>
      acc.then((value) => {
        step(value);
        return curr();
      }),
    Promise.resolve<unknown>(undefined),
  );

const pickRandom = <T>(array: T[]): T =>
  array[randomInteger(0, array.length - 1)] as T;

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

interface Quiz {
  category: string;
  id: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  question: {
    text: string;
  };
  tags: string[];
  type: string;
  difficulty: string;
  regions: string[];
  isNiche: boolean;
  hint: string;
  explanation: string;
  sources: {
    urls: string[];
    checkedAt: string;
  };
}

interface RandomData<
  _E extends string,
  D = {},
  P extends Record<string, string | number | boolean> = {},
> {
  data: D[];
  meta: {
    endpoint: string;
    count: number;
    seed: number;
    params: P;
    generatedAt: string;
  };
}

type MarkdownData = RandomData<
  "markdown",
  {
    markdown: string;
    wordCount: number;
    sections: number;
  },
  {
    sections: number;
    codeBlocks: boolean;
    tables: boolean;
    lists: boolean;
    links: boolean;
    images: boolean;
  }
>;

type ReviewData = RandomData<
  "reviews",
  {
    rating: number;
    title: string;
    body: string;
    author: string;
    date: string;
    verified: boolean;
    helpfulCount: number;
  },
  {
    minRating: number;
    maxRating: number;
    from: string;
    to: string;
  }
>;

type TaskData = RandomData<
  "tasks",
  {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    assignee: {
      id: string;
      name: string;
      avatarUrl: string;
    };
    blocker: string | null;
    dueDate: string;
    completedAt: string | null;
    createdAt: string;
    tags: string[];
    subtasks: {
      id: string;
      title: string;
      completed: boolean;
    }[];
  },
  {
    from: string;
    to: string;
  }
>;

type InvoiceData = RandomData<
  "invoices",
  {
    id: string;
    invoiceNumber: string;
    status: string;
    currency: string;
    seller: {
      id: string;
      name: string;
      email: string;
      address: string;
    };
    buyer: {
      id: string;
      name: string;
      email: string;
    };
    lineItems: {
      description: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }[];
    issueDate: string;
    dueDate: string;
    paidAt: string;
    subtotal: number;
    tax: number;
    total: number;
    amountPaid: number;
    balanceDue: number;
  },
  {
    currency: string;
    minItems: number;
    maxItems: number;
    taxRate: number;
    from: string;
    to: string;
  }
>;

type AvatarData = RandomData<
  "avatars",
  {
    url: string;
    style: string;
    seed: string;
  },
  {
    size: number;
  }
>;

const getIp = () =>
  fetchJson<{ ip: string }>("https://api.ipify.org?format=json").then(
    (_ip) => ({ endpoint: "ip", data: _ip }),
  );

const getQuiz = () =>
  fetchJson<Quiz[]>("https://the-trivia-api.com/v2/questions?limit=10").then(
    (data) => ({ endpoint: "tests", data }),
  );

const getRandomData = <T extends RandomData<any>>(
  endpoint: T extends RandomData<infer E> ? E : string,
  params: T extends RandomData<any, any, infer P>
    ? Partial<P>
    : any = {} as any,
  { count, seed } = {
    count: randomInteger(8, 16),
    seed: randomInteger(1, 10000),
  },
) => {
  return Promise.allSettled([
    fetchJson<T>(
      `https://randomapi.dev/api/${endpoint}?count=${count}&seed=${seed}&${new URLSearchParams(params as Record<string, string>).toString()}`,
    ).then((data) => ({ endpoint, data })),
    sleep(randomInteger(8, 12) * 100),
  ]).then(([results]) =>
    results.status === "fulfilled" ? results.value : { endpoint, data: null },
  );
};

const getMarkdown = () => getRandomData<MarkdownData>("markdown");
const getReviews = () => getRandomData<ReviewData>("reviews");
const getTasks = () => getRandomData<TaskData>("tasks");
const getInvoices = () => getRandomData<InvoiceData>("invoices");
const getAvatars = () => getRandomData<AvatarData>("avatars");

const dataFetchers = [
  getMarkdown,
  getReviews,
  getTasks,
  getInvoices,
  getAvatars,
];

export const loadData = (step: (value: unknown) => void) =>
  promiseChain(
    step,
    getIp,
    getQuiz,
    ...Array.from({ length: randomInteger(3, 6) * 2 }, () =>
      pickRandom(dataFetchers),
    ),
  );
