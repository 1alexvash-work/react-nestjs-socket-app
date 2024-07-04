import Image from 'next/image';
import { useEffect, useState } from 'react';

import { io } from 'socket.io-client';

const URL = 'http://localhost:3001/chat';

const socket = io(URL);
console.log('socket:', socket);

const API_URL = 'http://localhost:3001';

type Channel = {
  id: string;
  createdAt: string;
  name: string;
  lastMessageSnippet: string;
  lastMessageCreatedAt: string;
};

type Message = {
  id: string;
  createdAt: string;
  content: string;
  senderName: string;
  channelId: string;
};

type MessagePayload = {
  content: string;
  channelId?: string;
  senderName?: string;
};

const DEFAULT_CHANNEL_ID = '86539db7-d307-4449-acd5-bb4127e3d4d7'; // todo make it dynamic

export default function Home() {
  const [userName, setUserName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setChannelMessages] = useState<Message[]>([]);
  const [activeChannelId, setActiveChannelId] = useState(DEFAULT_CHANNEL_ID);
  const [channels, setChannels] = useState<Channel[]>([]);

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messageEvents, setMessageEvents] = useState<any[]>([]); // * Interface do not match
  console.log('messageEvents:', messageEvents);

  const handleMessageForm = () => {
    if (userName.trim() === '') {
      alert('Username field is empty');
    }

    if (message.trim() === '') {
      alert('Message field is empty');
    }

    // Emit websocket event
    const payload: MessagePayload = {
      content: message,
      channelId: activeChannelId,
      senderName: userName,
    };

    socket.emit('message', payload);
    setMessage('');
  };

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onMessageEvent(value: any) {
      console.log('Received a websocket event with a message');
      setMessageEvents((previous: any) => [...previous, value]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('message', onMessageEvent);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('message', onMessageEvent);
    };
  }, []);

  useEffect(() => {
    async function fetchMessage() {
      const res = await fetch(`${API_URL}/messages/${activeChannelId}`);
      if (res.ok) {
        const messages = await res.json();
        setChannelMessages(messages);
      }
    }

    fetchMessage();
  }, [activeChannelId]);

  useEffect(() => {
    async function getChannels() {
      const res = await fetch(`${API_URL}/channels`);
      if (res.ok) {
        const channels = await res.json();
        setChannels(channels);
      }
    }

    getChannels();
  }, []);

  return (
    <main className="w-[50rem] mx-auto p-4">
      {/* TODO */}

      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl mb-4">Chat app</h1>
          <h1 className="text-xl mb-2">Channels</h1>

          {channels.map((channel) => (
            <div
              className={`shadow-md p-4 mb-1 cursor-pointer ${
                channel.id === activeChannelId ? 'bg-blue-500 text-white' : ''
              } `}
              key={channel.id}
              onClick={() => setActiveChannelId(channel.id)}
            >
              <p
                className={`${
                  activeChannelId === channel.id ? 'font-bold' : ''
                } `}
              >
                {channel.name}
              </p>

              <small>{channel.lastMessageSnippet}</small>
            </div>
          ))}
        </div>
        <div className="w-[20rem]">
          <h1 className="text-xl mb-2">List of messages</h1>
          {messages.map((message) => (
            <div
              key={message.id + Math.random()} // Hack
              className="bg-gray-300 px-3 py-2 rounded-lg rounded-tr-none mb-4"
            >
              <p className="font-bold">{message.senderName}</p>
              {message.content}
            </div>
          ))}
          {messageEvents
            .filter((message) => message.channelId === activeChannelId)
            .map((message) => (
              <div
                key={message.id + Math.random()} // Hack
                className="bg-gray-300 px-3 py-2 rounded-lg rounded-tr-none mb-4"
              >
                <p className="font-bold">{message.senderName}</p>
                {message.content}
              </div>
            ))}
        </div>
      </div>

      {/* form submit button */}
      <div className="bg-white shadow-md rounded p-4 my-4 ">
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
          type="text"
          placeholder="Username"
          value={userName}
          onChange={(event) => setUserName(event.target.value)}
        />

        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
          type="text"
          placeholder="Text content of your message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />

        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={handleMessageForm}
          >
            Send the message
          </button>
        </div>
      </div>
    </main>
  );
}
