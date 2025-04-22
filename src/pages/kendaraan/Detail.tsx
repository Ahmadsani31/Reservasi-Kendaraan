
import React, { useEffect, useRef, useState } from 'react';
import MobileContainer from '@/components/MobileContainer';
import MobileOnlyNotice from '@/components/MobileOnlyNotice';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import { Camera, CameraOff, Factory, Gauge, Loader2, Pencil, PencilIcon, PencilLineIcon, PencilRuler, SearchIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from '@/components/ui/textarea';
import Webcam from "react-webcam";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { useGeolocated } from 'react-geolocated';

import api from '@/api/service';


const Detail = () => {

  const { uuid } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    kendaraan_id: "",
    kegiatan: "",
    spidometer: "",
    latitude: "",
    longitude: "",
    fileImage: null
  })

  const [row, setRow] = useState({
    name: "",
    no_polisi: "",
  })

  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: Infinity,
    },
    watchPosition: true,
    userDecisionTimeout: 5000,
  });

  useEffect(() => {

    setForm({
      ...form,
      latitude: coords?.latitude ? coords.latitude.toString() : "",
      longitude: coords?.longitude ? coords.longitude.toString() : "",
    })


  }, [coords]);

  useEffect(() => {

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/reservasi/detail?uniqued_id=${uuid}`);

        // console.log(res.items.model);
        setRow({
          name: res.items.model,
          no_polisi: res.items.no_polisi,
        })
        setForm({
          ...form,
          kendaraan_id: res.items.id,
        })
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [uuid]);

  const webcamRef = useRef<Webcam | null>(null);
  const [image, setImage] = useState<string | null>(null);

  const captureImage = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      const blob = await fetch(imageSrc).then(res => res.blob());
      setForm({
        ...form,
        fileImage: blob,
      })
      setImage(imageSrc);
      setOpen(!open)
      setIsActive(!isActive)
    }
  };

  const retakeImage = () => {
    setImage(null);
    setOpen(!open)
    setIsActive(!isActive)
    setForm({ ...form, spidometer: '' });
  };


  const handelInput = (event: any) => {
    event.preventDefault();
    const { name, value } = event.target;
    // console.log(name, value)
    setForm({ ...form, [name]: value });
  }

  const [open, setOpen] = useState<boolean>(false);

  const [errors, setErrors] = useState({ kegiatan: '', spidometer: '' });

  const [isActive, setIsActive] = useState<boolean>(false);

  const validateForm = () => {
    const newErrors = { kegiatan: '', spidometer: '' };
    let isValid = true;

    if (!form.kegiatan) {
      newErrors.kegiatan = 'Kegiatan wajib diisi';
      isValid = false;
    }

    if (!form.spidometer) {
      newErrors.spidometer = 'Spidometer wajib diisi';
      isValid = false;
    }

    if (!form.fileImage) {
      toast.error('Capture spidometer kendaraan wajib diambil!')
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) return;

    if (!isGeolocationAvailable) {
      toast.error("Your browser does not support Geolocation.");
      return;
    }

    if (isGeolocationEnabled !== true) {
      toast.error("Geolocation is not enabled. Please enable it in your browser settings.");
      return;
    }

    setIsLoading(true)
    try {

      const formData = new FormData();

      formData.append('fileImage', form.fileImage, 'spidometer-capture.png');
      formData.append('kegiatan', form.kegiatan);
      formData.append('spidometer', form.spidometer);
      formData.append('latitude', form.latitude);
      formData.append('longitude', form.longitude);
      formData.append('kendaraan_id', form.kendaraan_id);

      const response = await api.postForm(`/reservasi/save_detail`, formData)
      if (response.status === true) {
        toast.success(response.message)
        localStorage.setItem('reservasi_id', response.reservasi_id);
        navigate('/reservasi');
      } else {
        toast.error(response.message)
      }

    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.response?.data?.message)
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <>
      {/* <MobileOnlyNotice /> */}

      <Header title="Detail" />

      <MobileContainer className="pt-20 pb-28">

        <div className="space-y-4">
          <Card className="p-4">
            <CardHeader className='text-center'>
              {loading ? (
                <div className="flex items-center justify-center space-x-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[250px]" />
                  </div>
                </div>
              ) : (
                <>
                  <CardTitle className='text-5xl'>{row.name}</CardTitle>
                  <CardDescription className='text-2xl'>{row.no_polisi}</CardDescription>
                </>
              )}

            </CardHeader>
          </Card>
          {loading ? null : (
            <Card>

              <CardContent>
                <form onSubmit={handleSubmit} method="post">
                  <div className="py-4">
                    <div className="mb-3">
                      <Label htmlFor="kegiatan" className='block text-sm font-medium mb-2'>Kegiatan</Label>
                      <Textarea name="kegiatan" id='kegiatan' placeholder="Kegiatan" className={errors.kegiatan ? "border-red-500" : ""} value={form.kegiatan} onChange={handelInput} />
                      {errors.kegiatan && (
                        <p className="text-sm ms-1 text-red-500">{errors.kegiatan}</p>
                      )}
                    </div>
                    <div className='mb-3'>
                      {image ? (
                        <>
                          <div className="relative">
                            <img src={image} alt="Image" className="w-full rounded-lg shadow-lg" />
                            <button type='button' onClick={retakeImage} className="flex items-center absolute bottom-0 right-0 bg-amber-500 text-white px-3 py-1 rounded-sm"><CameraOff /> retake</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Button type='button' variant="ghost" onClick={() => setOpen(!open)} className='w-full bg-teal-500 text-white'>
                            <Gauge /> Foto Spidometer
                          </Button>
                        </>
                      )}
                    </div>
                    <div className={`mb-3 ${isActive ? '' : 'hidden'}`}>
                      <Label htmlFor="spidometer" className='block text-sm font-medium mb-2'>Nilai Spidometer</Label>
                      <Input type="number" name="spidometer" id='spidometer' value={form.spidometer} onChange={handelInput} className={errors.spidometer ? "border-red-500" : ""} placeholder="Nilai spidometer" />
                      {errors.spidometer && (
                        <p className="text-sm ms-1 text-red-500">{errors.spidometer}</p>
                      )}
                    </div>
                    <div className='mb-3'>
                      <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Memproses...
                          </>
                        ) : (
                          'Submit'
                        )}
                      </Button>
                    </div>

                  </div>

                </form>
              </CardContent>
            </Card>

          )}

        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Spidometer</DialogTitle>
              <DialogDescription>
                Silahkan foto Spidometer sebelum melanjutkan pemakaian kendaraan
              </DialogDescription>
            </DialogHeader>
            <div className="m-1">
              <Webcam ref={webcamRef} screenshotFormat="image/png" videoConstraints={{ facingMode: "environment" }} className="w-full max-w-md rounded-lg shadow-lg" />
            </div>
            <DialogFooter className='gap-2'>

              <Button type='button' variant="ghost" onClick={captureImage} className='w-full bg-teal-500 hover:bg-teal-300 text-white'>
                <Camera /> Capture
              </Button>

            </DialogFooter>
          </DialogContent>
        </Dialog>
      </MobileContainer>

      <Navbar />
    </>
  );
};

export default Detail;
