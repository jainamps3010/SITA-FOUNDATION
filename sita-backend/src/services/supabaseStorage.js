'use strict';

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function uploadFile(fileBuffer, fileName, mimeType, folder) {
  const filePath = folder + '/' + Date.now() + '_' + fileName;
  const { data, error } = await supabase.storage
    .from('sita-documents')
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: false
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('sita-documents')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

module.exports = { uploadFile };
