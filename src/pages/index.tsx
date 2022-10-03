import type { NextPage } from "next";
import { Dispatch, SetStateAction, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { v4 as uuid } from "uuid";
interface Event<T = EventTarget> {
  target: T;
}

const Home: NextPage = () => {
  const [formState, setFormState] = useState("open");
  const [files, setFile] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [todoToEditTitle, setTodoToEditTitle] = useState("");
  const [todoToEditContent, setTodoToEditContent] = useState("");
  const [todoToEdit, setTodoToEdit] = useState<Todo>();
  const [showModal, setShowModal] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: uuid(),
      todoTitle: "Finish DB Architecture",
      todoContent: "We have to finish the DB Architecture",
      status: "open",
    },
    {
      id: uuid(),
      todoTitle: "Finish POC",
      todoContent: "We have to finish the POC",
      status: "done",
    },
  ]);

  const handleShowModal = (showModal: boolean, todo: Todo | null = null) => {
    if (todo) {
      setTodoToEdit(todo);
    }
    setShowModal(showModal);
  };

  const handleRemove = (todo: Todo) => {
    // TODO: REMOVE Todo from DB react.query

    const newTodos = todos.filter(function (obj) {
      return obj.id !== todo.id;
    });
    setTodos(newTodos);
  };

  const handleEdit = (todo: Todo) => {
    // TODO: EDIT Todo on DB with react.query

    const updatedTodo: Todo = {
      id: todo.id,
      todoTitle: todoToEditTitle || todo.todoTitle,
      todoContent: todoToEditContent || todo.todoContent,
      todoImages: todo.todoImages ? [...todo.todoImages] : [],
      status: "open",
    };
    const newTodos = todos.map(function (obj) {
      const res = obj.id !== todo.id ? obj : updatedTodo;
      console.log(res);
      return res;
    });
    setTodos(newTodos);
    setShowModal(false);
  };

  const handleFinish = (todo: Todo) => {
    // TODO: EDIT Todo on DB with react.query

    const newTodos = todos.map(function (obj) {
      if (obj.id === todo.id) {
        obj["status"] = obj.status === "done" ? "open" : "done";
      }
      return obj;
    });
    setTodos(newTodos);
  };

  const handleFile = (e: Event<HTMLInputElement>) => {
    setMessage("");
    const newFiles = e.target.files;
    if (!newFiles) return;
    for (let i = 0; i < newFiles.length; i++) {
      const newFile = newFiles[i];
      if (newFile !== undefined) {
        const fileType = newFile.type ?? "invalidFormat";
        const validImageTypes = ["image/gif", "image/jpeg", "image/png"];
        if (validImageTypes.includes(fileType)) {
          setFile([...files, newFile]);
        } else {
          setMessage("only images accepted");
        }
      }
    }
  };

  const removeImage = (i: string) => {
    setFile(files.filter((x) => x.name !== i));
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const myHeaders = new Headers();
    const todo: Todo = {
      id: uuid(),
      todoTitle: event.currentTarget.todoTitle.value,
      todoContent: event.currentTarget.todoContent.value,
      todoImages: [...files],
      status: "open",
    };

    const formData = new FormData();
    Object.entries(todo).forEach(([key, value]) => {
      if (typeof value === "string") return formData.append(key, value);
    });

    for (let i = 0; i < Math.min(todo?.todoImages?.length ?? 0, 5); i++) {
      const blob = todo?.todoImages?.[i];
      if (blob) formData.append("uploads", blob);
    }

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: formData,
      credentials: "include",
    };
    try {
      const newTodos = [...todos, todo];
      setTodos(newTodos);
      const mode = process.env.MODE;
      const url =
        mode === "dev"
          ? `http://localhost:8000/support/ticket`
          : `https://api.inside-nfts.com/support/ticket`;
      const response = await fetch(url, requestOptions);
      if (true) {
        (document?.getElementById("todoForm") as HTMLFormElement)?.reset();
        setFile([]);
        setFormState("sent");
      } else {
        setFormState("error");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto flex min-h-screen flex-col items-center  p-4">
        <h1 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
          magna<span className="text-purple-300">Todo</span>
        </h1>
        {showModal && todoToEdit ? (
          <TodoEdit
            setShowModal={handleShowModal}
            setTodoToEditTitle={setTodoToEditTitle}
            setTodoToEditContent={setTodoToEditContent}
            handleEdit={handleEdit}
            todo={todoToEdit}
          />
        ) : null}
        <div className="flex w-full items-start space-x-10">
          <div className="mt-10 flex w-1/2 flex-col items-start">
            <div className="w-full">
              <div className="mt-5 md:col-span-2 md:mt-0">
                <TodoForm
                  key="static"
                  submitForm={submitForm}
                  files={files}
                  formState={formState}
                  message={message}
                  handleFile={handleFile}
                  removeImage={removeImage}
                />
              </div>
            </div>
          </div>
          <div className="mt-10 flex w-1/2 flex-col">
            {todos.map((todo: Todo) => {
              return (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  handleRemove={handleRemove}
                  handleShowModal={handleShowModal}
                  handleFinish={handleFinish}
                />
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;

type Todo = {
  id: string;
  todoTitle: string;
  todoContent: string;
  status: string;
  todoImages?: File[];
};

type TodoCardProps = {
  todo: Todo;
  handleRemove: Handler;
  handleShowModal: (showModal: boolean, todo: Todo | null) => void;
  handleFinish: Handler;
};

type Handler = (todo: Todo) => void;

const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  handleRemove,
  handleShowModal,
  handleFinish,
}) => {
  return (
    <div className=" mb-5 flex w-full flex-col items-start ">
      <div
        className={`w-full rounded-lg border border-gray-200 p-6 shadow-md dark:border-gray-700 ${
          todo?.status === "done" ? "bg-todoDone" : "bg-todoOpen"
        }`}
      >
        <h5
          className={`mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white ${
            todo.status === "done" ? "opacity-30" : ""
          }`}
        >
          {todo.todoTitle}
        </h5>
        <p
          className={`mb-3 font-normal text-gray-700 dark:text-gray-400 ${
            todo.status === "done" ? "opacity-30" : ""
          }`}
        >
          {todo.todoContent}
        </p>
        <div className="mt-12 flex w-full items-center justify-end space-x-2">
          {todo?.todoImages?.map((image, i) => {
            return (
              <div
                key={i}
                className={`${
                  todo.status === "done" ? "pointer-events-none opacity-30" : ""
                }`}
              >
                <Image
                  width="50"
                  height="50"
                  alt=""
                  className="h-full w-full rounded"
                  src={URL.createObjectURL(image)}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex w-full items-center justify-end space-x-2">
          <div className="mr-auto mt-2">
            <label className="inline-flex items-center ">
              <input
                type="checkbox"
                onChange={() => handleFinish(todo)}
                className="h-6 w-6 shadow"
                checked={todo.status === "done" ? true : false}
              />
            </label>
          </div>
          <a
            onClick={() => handleShowModal(true, todo)}
            // style={{}}
            className={`inline-flex cursor-pointer  items-center rounded-lg bg-cyan-700 py-2 px-3 text-center text-sm font-medium text-white hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-800 
            ${todo.status === "done" ? "pointer-events-none opacity-30" : ""}`}
          >
            EDIT
          </a>
          <a
            onClick={() => handleRemove(todo)}
            className=" inline-flex cursor-pointer items-center rounded-lg bg-red-700 py-2 px-3 text-center text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
          >
            DELETE
          </a>
        </div>
      </div>
    </div>
  );
};

type TodoFormProps = {
  formState: string;
  message: string;
  files: File[];
  submitForm: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleFile: (e: Event<HTMLInputElement>) => void;
  removeImage: (name: string) => void;
};

const TodoForm: React.FC<TodoFormProps> = ({
  files,
  formState,
  message,
  handleFile,
  submitForm,
  removeImage,
}) => {
  const successResponseMessageHead = "Your Todo has been added!";
  const successRresponseMessageBody = "It should show on the right 👉🏽";
  const errorResponseMessageHead = "This didn't work";
  const errorResponseMessageBody =
    "Unfortunately, we couldn't process your request. Please try again...";
  return (
    <form id="todoForm" onSubmit={submitForm}>
      <div className=" shadow-xl sm:overflow-hidden sm:rounded-xl">
        <div className="space-y-6 bg-gray-700 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-3 sm:col-span-2">
              <div>
                <label
                  htmlFor="small-input"
                  className="mb-2 block text-sm font-medium text-gray-300 "
                >
                  Todo Title
                </label>
                <input
                  name="todoTitle"
                  type="text"
                  id="small-input"
                  placeholder="Title for your todo..."
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-400 dark:bg-gray-500 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="message"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Todo
            </label>

            <div className="mt-1">
              <textarea
                name="todoContent"
                id="message"
                rows={4}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-400 dark:bg-gray-500 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder="Leave a comment..."
                required
              ></textarea>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Picture Attachments
            </label>
            <div className="relative flex w-full items-center justify-center">
              <label
                htmlFor="dropzone-file"
                className="dark:hover:bg-bray-800 flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    aria-hidden="true"
                    className="mb-3 h-10 w-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
                <span className="mb-1 flex items-center justify-center bg-white text-[12px] text-red-500">
                  {message}
                </span>
                <input
                  name="uploads"
                  type="file"
                  onChange={handleFile}
                  className="absolute h-full w-full opacity-0"
                  multiple
                />
              </label>
            </div>
            <div className="mt-4 w-full rounded-md">
              <div className="mt-2 flex flex-wrap gap-2">
                {files.map((file: File, key) => {
                  return (
                    <div
                      key={key}
                      className="flex h-16 w-full items-center justify-between rounded border border-gray-400 bg-gray-500 p-3 text-white"
                    >
                      <div className="flex flex-row items-center gap-2">
                        <div className="h-12 w-12 ">
                          <Image
                            width="100"
                            height="100"
                            alt=""
                            className="h-full w-full rounded"
                            src={URL.createObjectURL(file)}
                          />
                        </div>
                        <span className="w-44 truncate">{file.name}</span>
                      </div>
                      <div
                        onClick={() => {
                          removeImage(file.name);
                        }}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-red-400"
                      >
                        <i className=" text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.25}
                            stroke="currentColor"
                            className="h-5 w-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </i>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 px-4 py-3 text-right sm:px-6">
          {formState !== "open" ? (
            <div
              className={`my-4 px-4 py-3 text-${
                formState === "sent" ? "green" : "red"
              }-900 bg-${
                formState === "sent" ? "green" : "red"
              }-100 border-t-4 border-${
                formState === "sent" ? "green" : "red"
              }-500 rounded-b shadow-md`}
              role="alert"
            >
              <div className="flex">
                <div className="py-1">
                  <svg
                    className={`mr-4 h-6 w-6 text-${
                      formState === "sent" ? "green" : "red"
                    }-500 fill-current`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold">
                    {formState === "sent"
                      ? successResponseMessageHead
                      : errorResponseMessageHead}
                  </p>
                  <p className="text-sm">
                    {formState === "sent"
                      ? successRresponseMessageBody
                      : errorResponseMessageBody}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-purple-400 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            SAVE
          </button>
        </div>
      </div>
    </form>
  );
};

type TodoEditProps = {
  todo: Todo;
  setShowModal: (showModal: boolean) => void;
  setTodoToEditTitle: Dispatch<SetStateAction<string>>;
  setTodoToEditContent: Dispatch<SetStateAction<string>>;
  handleEdit: Handler;
};

const TodoEdit: React.FC<TodoEditProps> = ({
  todo,
  setTodoToEditTitle,
  setTodoToEditContent,
  setShowModal,
  handleEdit,
}) => {
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center  outline-none focus:outline-none">
        <div className="relative mx-auto my-6 w-auto max-w-3xl">
          {/*content*/}
          <div className="relative flex w-full flex-col rounded-lg border border-gray-600 bg-gray-800 p-3 shadow-2xl outline-none focus:outline-none">
            {/*header*/}
            <div className="flex items-start justify-between rounded-t  p-5">
              <h3 className="text-3xl font-semibold text-gray-200">
                Edit Your Todo
              </h3>
              <button
                className="float-right ml-auto border-0 bg-transparent p-1 text-3xl font-semibold leading-none text-black opacity-5 outline-none focus:outline-none"
                onClick={() => setShowModal(false)}
              >
                <span className="block h-6 w-6 bg-transparent text-2xl text-black  outline-none focus:outline-none">
                  ×
                </span>
              </button>
            </div>
            {/*body*/}
            <div className=" space-y-6 rounded-lg bg-gray-700 px-4 py-5 sm:p-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-3 sm:col-span-2">
                  <div>
                    <label
                      htmlFor="small-input"
                      className="mb-2 block text-sm font-medium text-gray-300 "
                    >
                      Todo Title
                    </label>
                    <input
                      name="todoTitle"
                      type="text"
                      defaultValue={todo?.todoTitle}
                      onChange={(e) => setTodoToEditTitle(e.target.value)}
                      placeholder="Title for your todo..."
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-400 dark:bg-gray-500 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Todo
                </label>

                <div className="mt-1">
                  <textarea
                    name="todoContent"
                    id="message"
                    defaultValue={todo?.todoContent}
                    onChange={(e) => setTodoToEditContent(e.target.value)}
                    rows={4}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-400 dark:bg-gray-500 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    placeholder="Leave a comment..."
                    required
                  ></textarea>
                </div>
              </div>
            </div>
            {/*footer*/}
            <div className="flex items-center justify-end space-x-4 rounded-b  p-6">
              <button
                className="rounded border-b-4 border-gray-700 bg-gray-500 px-4 py-2 font-bold text-white hover:border-gray-500 hover:bg-gray-400"
                type="button"
                onClick={() => setShowModal(false)}
              >
                CANCEL
              </button>
              <button
                onClick={() => handleEdit(todo)}
                type="button"
                className="rounded border-b-4 border-purple-700 bg-purple-500 px-4 py-2 font-bold text-white hover:border-purple-500 hover:bg-purple-400"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
    </>
  );
};
