import React, { useEffect, useState } from 'react';
import {AWSCMSCrudSvc} from '../helpers/AWSCMSCrudSvc';
import { config } from '../config';
import {ICMSCrudService} from "../helpers/ICMSCrudService";

interface SelectImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, key: string) => void;
  dataService: ICMSCrudService;
}

const SelectImageModal: React.FC<SelectImageModalProps> = ({ isOpen, onClose, onSelect, dataService }) => {
  const [imageKeys, setImageKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 // console.log("SelectImageModal initialized with dataService:", dataService);
  const test = dataService.listMedia(config.StageBucket, config.MediaPrefix);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);

    dataService.listMedia(config.StageBucket, config.MediaPrefix)
      .then(keys => {
        setImageKeys(keys.filter(k => k.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)));
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="select-image-modal-backdrop">
      <div className="select-image-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Select an Image</h2>
        {loading && <div>Loading images...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <div className="image-gallery">
          {imageKeys.map(key => {
            const url = `${config.MediaProxy}/${key}`;
            return (
              <div key={key} className="image-thumb" onClick={() => onSelect(url, key)} title={key}>
                <img src={url} alt={key} className="image-thumb-img" />
              </div>
            );
          })}
          {(!loading && imageKeys.length === 0 && !error) && <div>No images found.</div>}
        </div>
      </div>
      <style>{`
        .select-image-modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .select-image-modal {
          background: #fff;
          border-radius: 10px;
          padding: 2rem 2.5rem 1.5rem 2.5rem;
          min-width: 350px;
          max-width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          position: relative;
        }
        .close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 2rem;
          color: #888;
          cursor: pointer;
          transition: color 0.2s;
        }
        .close-btn:hover {
          color: #222;
        }
        .image-gallery {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
          margin-top: 1.5rem;
          justify-content: flex-start;
        }
        .image-thumb {
          width: 110px;
          height: 110px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          background: #f7f7f7;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border 0.2s, box-shadow 0.2s;
        }
        .image-thumb:hover {
          border: 2px solid #0078d4;
          box-shadow: 0 4px 16px rgba(0,120,212,0.12);
        }
        .image-thumb-img {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 4px;
          background: #eee;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .select-image-modal h2 {
          margin-top: 0;
          font-size: 1.3rem;
          font-weight: 600;
          color: #222;
        }
      `}</style>
    </div>
  );
};

export default SelectImageModal;
