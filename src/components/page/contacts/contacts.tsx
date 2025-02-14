import { Conversation } from '../../../model/conversation';
import './contacts.scss';
import { ServerRepo } from '../../../api/server';
import { formatDate, formatRelativeDate } from '../../../functions/formatDate';
import toast from 'react-hot-toast';
import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const serverCtrl = new ServerRepo();

type PropsType = {
  searchedNumber: string;
  handleChange: (e: any) => void;
  filteredConversations: any | null;
  conversations: any[];
  currentNumber: string | null;
  renderMessages: (e: any) => void;
  nextTokenConversation: string;
  authToken: string;
  setConversations: any;
  setNextTokenConversation: any;
  handleSearchConversations: (e: any) => void;
};

export function Contacts({
  conversations,
  currentNumber,
  filteredConversations,
  handleChange,
  searchedNumber,
  renderMessages,
  nextTokenConversation,
  authToken,
  setConversations,
  setNextTokenConversation,
  handleSearchConversations,
}: PropsType) {
  const [areMoreConversations, setAreMoreConversations] = useState(true);
  const conversationsContainerRef = useRef<HTMLDivElement>(null);

  const nextTokenRef = useRef(nextTokenConversation);
  const authTokenRef = useRef(authToken);

  useEffect(() => {
    nextTokenRef.current = nextTokenConversation;
  }, [nextTokenConversation]);

  useEffect(() => {
    authTokenRef.current = authToken;
  }, [authToken]);

  const loadMoreConversations = async () => {
    if (nextTokenRef.current && authTokenRef.current) {
      const moreConversations = await serverCtrl.getConversations(
        '70622cdb-e5f9-47df-9d89-3ea3b6363bc5',
        authTokenRef.current,
        nextTokenRef.current
      );

      if (moreConversations) {
        setConversations((prevMessages: any) => [
          ...prevMessages,
          ...moreConversations.conversations,
        ]);

        setNextTokenConversation(moreConversations.meta.nextToken || '');
      } else {
        setAreMoreConversations(false);
        toast.error('No hay más conversaciones');
      }
    } else {
      setAreMoreConversations(false);
      toast.error('No hay más conversaciones');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (conversationsContainerRef.current) {
        const container = conversationsContainerRef.current;
        const isAtBottom =
          container.scrollTop + container.clientHeight >=
          container.scrollHeight - 20;

        if (isAtBottom && areMoreConversations) {
          loadMoreConversations();
        }
      }
    };

    const container = conversationsContainerRef.current;

    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div className="left">
      <div className="search-number-input">
        <input
          type="text"
          name="searchedNumber"
          placeholder="Phone Number"
          value={searchedNumber}
          onChange={handleChange}
        />
        <button
          className="search-button"
          onClick={() => handleSearchConversations(searchedNumber)}
        >
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>
      <div className="conversations" ref={conversationsContainerRef}>
        <ul>
          {(filteredConversations ? filteredConversations : conversations)
            .filter(
              (v: any, i: any, a: any) =>
                a.findIndex(
                  (t: any) =>
                    t.tags['whatsapp:userPhone'] ===
                    v.tags['whatsapp:userPhone']
                ) === i
            )
            .map((conversation: Conversation, index: number) => (
              <li
                key={`${conversation.id}-${index}`}
                onClick={() =>
                  renderMessages(conversation.tags['whatsapp:userPhone'])
                }
                className={
                  currentNumber &&
                  currentNumber === conversation.tags['whatsapp:userPhone']
                    ? 'active'
                    : ''
                }
              >
                <div className="conversation">
                  <div className="user-info">
                    <div className="number">
                      {conversation.tags['whatsapp:userPhone']}
                    </div>
                  </div>
                  <div className="conversation-info">
                    <div className="number-of-conversations">
                      {' '}
                      Últ.
                      {formatDate(conversation.updatedAt)}
                    </div>
                    <div className="last-message">
                      {formatRelativeDate(conversation.updatedAt)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
        </ul>

        {/*  <button onClick={() => loadMoreConversations()}>Cargar más</button> */}
      </div>
    </div>
  );
}
