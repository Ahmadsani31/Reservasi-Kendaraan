
import React, { useEffect, useRef, useState } from 'react';
import MobileContainer from '@/components/MobileContainer';
import MobileOnlyNotice from '@/components/MobileOnlyNotice';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';


import api from '@/api/service';

import Reservasi from './Reservasi';
import Checkpoint from './Checkpoint';
import PageLoading from '@/components/PageLoading';
const Re = () => {
  const [loading, setLoading] = useState(false);
  const [checkpoint, setCheckpoint] = useState(false);
  const [checkpointID, setCheckpointID] = useState("");

  useEffect(() => {
    const reservasi_id = localStorage.getItem('reservasi_id');
    if (reservasi_id) {
      fetchData(reservasi_id);
    }
  }, []);

  const fetchData = async (reservasi_id: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/checkpoint/aktif`, {
        params: {
          reservasi_id: reservasi_id,
        },
      });
      if (res.status === true) {
        setCheckpoint(true);
        setCheckpointID(res.checkpoint_id);
        // localStorage.setItem('reservasi_id', res.items.id);

      }

    } catch (error) {
      setCheckpoint(false);
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }

  };

  return (
    <>
      <Header title={checkpoint ? 'Pengisian BBM' : "Perjalanan"} />
      {loading && <PageLoading />}
      <MobileContainer className="pt-20 pb-28">
        {checkpoint ? (
          < Checkpoint checkpointID={checkpointID} setLoading={setLoading} />
        ) : (
          <Reservasi setLoading={setLoading} />
        )}
      </MobileContainer >

      <Navbar />
    </>
  );
};

export default Re;
