import { useEffect, useState } from 'react';
import './homePage.scss';
import { ServerRepo } from '../../api/server';
import { Conversation } from '../../model/conversation';
import { Contacts } from '../../components/page/contacts/contacts';
import toast from 'react-hot-toast';
import { format, isToday, isYesterday, parseISO, isSameDay } from 'date-fns';
import { Message } from '../../model/message';
import {
  MinChatUiProvider,
  MainContainer,
  MessageContainer,
  MessageList,
  MessageHeader,
} from '@minchat/react-chat-ui';

const serverCtrl = new ServerRepo();

export default function HomePage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<
    any | null
  >(null);
  const [searchedNumber, setSearchedNumber] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [nextTokenConversation, setNextTokenConversation] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [nextTokenMessages, setNextTokenMessages] = useState('');
  const [currentNumber, setCurrentNumber] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<any | null>(
    null
  );
  const [currentConversationIds, setCurrentConversationIds] = useState<any[]>(
    []
  );
  const [noMoreMessages, setNoMoreMessages] = useState<boolean>(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    switch (name) {
      case 'searchedNumber':
        setSearchedNumber(value);
        if (value.length === 0) {
          setFilteredConversations(null);
        }
        break;
      case 'fromDate':
        setFromDate(value);
        break;
      case 'toDate':
        setToDate(value);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    (async () => {
      let token;

      if (authToken.length === 0) {
        token = await serverCtrl.getToken();

        setAuthToken(token);
      } else {
        token = authToken;
      }

      if (conversations.length === 0) {
        const conversations = await serverCtrl.getConversations(
          '70622cdb-e5f9-47df-9d89-3ea3b6363bc5',
          token
        );

        if (conversations.meta.nextToken) {
          setNextTokenConversation(conversations.meta.nextToken);
        }

        setConversations(conversations.conversations);
      } /*  else {
        if (searchedNumber.length > 0) {
          const filtered = conversations.filter((conversation: any) => {
            // Asegurarse de que 'tags' existe y que contiene la propiedad 'whatsapp:userPhone'
            return (
              conversation.tags &&
              conversation.tags['whatsapp:userPhone'] &&
              conversation.tags['whatsapp:userPhone'].includes(searchedNumber)
            );
          });

          if (filtered.length > 0) {
            setFilteredConversations(filtered);
          } else {
            setFilteredConversations([]);
          }
        }
      } */
    })();
  }, [searchedNumber, conversations]);

  const handleSearchConversations = async (searchedNumber: string) => {
    const filteredConversations = await serverCtrl.getConversations(
      '70622cdb-e5f9-47df-9d89-3ea3b6363bc5',
      authToken,
      undefined,
      searchedNumber
    );

    if (filteredConversations.conversations.length > 0) {
      setFilteredConversations(filteredConversations.conversations);
      renderMessages(searchedNumber);
    } else {
      setFilteredConversations([]);
      toast.error('No se encontró el número');
    }
  };

  const scrollToBottom = () => {
    const messagesContainer = document.querySelector('.fpeuA-D');
    if (messagesContainer) {
      messagesContainer!.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentNumber]);

  const renderMessages = async (userNumber: string) => {
    setNoMoreMessages(false);
    const conversations = await serverCtrl.getConversations(
      '70622cdb-e5f9-47df-9d89-3ea3b6363bc5',
      authToken,
      undefined,
      userNumber
    );

    const conversationIds = conversations.conversations.map(
      (conversation: Conversation) => {
        return conversation.id;
      }
    );

    setCurrentConversation(conversationIds[0]);
    setCurrentConversationIds(conversationIds);

    const messages = await serverCtrl.getMessages(
      '70622cdb-e5f9-47df-9d89-3ea3b6363bc5',
      authToken,
      conversationIds[0]
    );

    setCurrentNumber(userNumber);
    await setMessages(messages.messages.reverse());

    if (messages.meta.nextToken) {
      setNextTokenMessages(messages.meta.nextToken);
    } else {
      setNextTokenMessages('');
    }
  };

  const renderMoreMessages = async (nextConversationId: string) => {
    const messagesContainer = document.querySelector('.fpeuA-D');
    const currentScrollPosition = messagesContainer!.scrollTop;
    const currentContentHeight = messagesContainer!.scrollHeight;
    const messages = await serverCtrl.getMessages(
      '70622cdb-e5f9-47df-9d89-3ea3b6363bc5',
      authToken,
      nextConversationId
    );

    if (messages.messages) {
      setMessages((prevMessages) => [
        ...messages.messages.reverse(),
        ...prevMessages,
      ]);
      setNextTokenMessages(messages.meta.nextToken || '');

      setTimeout(() => {
        if (messagesContainer) {
          const newContentHeight = messagesContainer.scrollHeight;

          const heightDifference = newContentHeight - currentContentHeight!;

          messagesContainer.scrollTop =
            currentScrollPosition! + heightDifference;
        }
      }, 50);
    }

    if (messages.meta.nextToken) {
      setNextTokenMessages(messages.meta.nextToken);
    } else {
      setNextTokenMessages('');
    }
  };

  const loadMoreMessages = async () => {
    if (nextTokenMessages) {
      const messagesContainer = document.querySelector('.fpeuA-D');
      const currentScrollPosition = messagesContainer!.scrollTop;
      const currentContentHeight = messagesContainer!.scrollHeight;

      const moreMessages = await serverCtrl.getMessages(
        '70622cdb-e5f9-47df-9d89-3ea3b6363bc5',
        authToken,
        currentConversation!,
        nextTokenMessages
      );

      if (moreMessages.messages) {
        setMessages((prevMessages) => [
          ...moreMessages.messages.reverse(),
          ...prevMessages,
        ]);
        setNextTokenMessages(moreMessages.meta.nextToken || '');
      }

      setTimeout(() => {
        if (messagesContainer) {
          const newContentHeight = messagesContainer.scrollHeight;

          const heightDifference = newContentHeight - currentContentHeight!;

          messagesContainer.scrollTop =
            currentScrollPosition! + heightDifference;
        }
      }, 50);
    } else {
      setNextTokenMessages('');

      const currentIndex = currentConversationIds.indexOf(currentConversation);

      if (
        currentIndex !== -1 &&
        currentIndex + 1 < currentConversationIds.length
      ) {
        const nextConversationId = currentConversationIds[currentIndex + 1];

        setCurrentConversation(nextConversationId);
        renderMoreMessages(nextConversationId);
      } else {
        toast.error('No hay más mensajes');
        setNoMoreMessages(true);
      }
    }
  };

  const formatMessagesWithClasses = (messages: Message[]) => {
    const formattedMessages: any[] = [];

    messages.forEach((message, index) => {
      const messageDate = parseISO(message.createdAt);

      // Insertar etiqueta de fecha como un mensaje del sistema
      if (
        index === 0 ||
        isNewDay(messages[index - 1].createdAt, message.createdAt)
      ) {
        formattedMessages.push({
          id: `date-${index}`,
          text: formatDateLabel(messageDate),
          user: { id: 'system', avatar: '' },
        });
      }

      // Mensajes normales
      formattedMessages.push({
        id: message.id,
        text: message.payload.text,
        createdAt: new Date(message.createdAt),
        user: {
          id: message.direction,
          name: message.direction,
          avatar: '',
        },
      });
    });

    return formattedMessages;
  };

  const isNewDay = (prevDate: string, currentDate: string): boolean => {
    const prev = parseISO(prevDate);
    const current = parseISO(currentDate);
    return !isSameDay(prev, current);
  };

  const formatDateLabel = (date: Date): string => {
    if (isToday(date)) {
      return 'HOY';
    } else if (isYesterday(date)) {
      return 'AYER';
    } else {
      return format(date, 'dd MMM yyyy').toUpperCase();
    }
  };

  useEffect(() => {
    setTimeout(() => {
      const messageElements = document.querySelectorAll('.sc-dtBdUo div');

      messageElements.forEach((element) => {
        element.classList.remove('system-message');
      });

      setTimeout(() => {
        const keywords = [
          'HOY',
          'AYER',
          'JAN',
          'FEB',
          'MAR',
          'APR',
          'MAY',
          'JUN',
          'JUL',
          'AUG',
          'SEP',
          'OCT',
          'NOV',
          'DEC',
        ];

        messageElements.forEach((element) => {
          const textContent = element.textContent?.trim() || '';
          const wordsInText = textContent.split(/\s+/);

          const isSystemMessage = keywords.some((keyword) =>
            wordsInText.includes(keyword)
          );

          if (isSystemMessage) {
            element.classList.add('system-message');
          }
        });
      }, 200);
    }, 200);
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      const messagesContainer = document.querySelector('.fpeuA-D');
      if (messagesContainer) {
        const currentScrollPosition = messagesContainer.scrollTop;

        if (currentScrollPosition === 0 && !noMoreMessages) {
          loadMoreMessages();
        }
      }
    };

    const messagesContainer = document.querySelector('.fpeuA-D');

    if (messagesContainer) {
      messagesContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (messagesContainer) {
        messagesContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [loadMoreMessages]);

  return (
    <div className="page-container">
      <div className="page-info">
        <Contacts
          searchedNumber={searchedNumber}
          handleChange={handleChange}
          filteredConversations={filteredConversations}
          conversations={conversations}
          currentNumber={currentNumber}
          renderMessages={renderMessages}
          nextTokenConversation={nextTokenConversation}
          authToken={authToken}
          setConversations={setConversations}
          setNextTokenConversation={setNextTokenConversation}
          handleSearchConversations={handleSearchConversations}
        ></Contacts>
        <div className="right">
          <div className="filters">
            <input
              type="text"
              name="fromDate"
              placeholder="De la fecha"
              value={fromDate}
              onChange={handleChange}
            />
            <input
              type="text"
              name="toDate"
              placeholder="A la fecha"
              value={toDate}
              onChange={handleChange}
            />
          </div>
          <div className="phone">
            <div className="screen">
              {currentNumber && (
                <>
                  <MinChatUiProvider theme="#6ea9d7">
                    <MainContainer style={{ height: '100%' }}>
                      <MessageContainer>
                        <MessageHeader onBack={() => setCurrentNumber(null)}>
                          {currentNumber}
                        </MessageHeader>
                        {/*  {!noMoreMessages && (
                          <button onClick={() => loadMoreMessages()}>
                            Cargar más
                          </button>
                        )} */}

                        <MessageList
                          currentUserId={'outgoing'}
                          messages={formatMessagesWithClasses(messages)}
                        />
                      </MessageContainer>
                    </MainContainer>
                  </MinChatUiProvider>
                </>
              )}
            </div>
            <div className="button"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
