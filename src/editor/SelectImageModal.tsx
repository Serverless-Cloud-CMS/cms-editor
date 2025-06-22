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
  console.log("SelectImageModal initialized with dataService:", test);

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
              <div key={key} className="image-thumb" onClick={() => onSelect(url, key)}>
                <img src={url} alt={key} />
              </div>
            );
          })}
          {(!loading && imageKeys.length === 0 && !error) && <div>No images found.</div>}
        </div>
      </div>
    </div>
  );
};

export default SelectImageModal;

